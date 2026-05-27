// src/electron/ipc.ts
import fs from 'fs'
import { ipcMain, BrowserWindow, app } from 'electron'
import { createConfigWindow } from '../config'
import { registerConfigIPC } from '../config/ipc'
import path from 'path'
import { defaultConfigData } from '../shared/mocks'
import { autoUpdater } from 'electron-updater'
import { platform } from '../platform'
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector'
export type configData = {
  channel: string
}

let configWin: BrowserWindow | null = null
let mainWin: BrowserWindow | null = null
let tiktokClient: TikTokLiveConnection | null = null
let tiktokChannel: string | null = null
let tiktokConnectToken = 0

type TikTokStatusPayload = {
  status: 'connected' | 'disconnected' | 'error'
  message?: string
  roomId?: string
}

type TikTokChatPayload = {
  username: string
  message: string
  channel: string
  timestamp: number
}

function formatRetryAfter(ms: number): string {
  const totalSeconds = Math.max(1, Math.ceil(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }

  return `${seconds}s`
}

function getTikTokFriendlyErrorMessage(error: unknown): string {
  const err = error as {
    name?: string
    message?: string
    reason?: string
    retryAfter?: number
  }

  const rawMessage = err?.message ?? ''
  const isRateLimit =
    err?.name === 'SignatureRateLimitError' ||
    rawMessage.includes('rate_limit_account_hour') ||
    err?.reason?.toLowerCase() === 'rate limited'

  if (isRateLimit) {
    const retryAfterMs = typeof err?.retryAfter === 'number' ? err.retryAfter : null
    if (retryAfterMs && retryAfterMs > 0) {
      return `Foram feitas muitas tentativas de conexão com o canal. Por isso, só será possível tentar de novo em ${formatRetryAfter(retryAfterMs)}.`
    }

    return 'Foram feitas muitas tentativas de conexão com o canal. Por isso, tente novamente em alguns minutos.'
  }

  return rawMessage || 'Erro desconhecido ao conectar TikTok'
}

function sendTikTokStatus(payload: TikTokStatusPayload) {
  if (mainWin && !mainWin.isDestroyed()) {
    mainWin.webContents.send('tiktok-status', payload)
  }
}

function sendTikTokChat(payload: TikTokChatPayload) {
  if (mainWin && !mainWin.isDestroyed()) {
    mainWin.webContents.send('tiktok-chat', payload)
  }
}

async function disconnectTikTok() {
  if (!tiktokClient) return

  try {
    await tiktokClient.disconnect()
  } catch (error) {
    console.error('Erro ao desconectar TikTok:', error)
  } finally {
    tiktokClient.removeAllListeners()
    tiktokClient = null
    tiktokChannel = null
    sendTikTokStatus({ status: 'disconnected' })
  }
}

function createTikTokClient(channel: string, fallback = false): TikTokLiveConnection {
  if (!fallback) {
    return new TikTokLiveConnection(channel)
  }

  // Fallback para casos em que o endpoint WS retorna HTTP 200
  return new TikTokLiveConnection(channel, {
    connectWithUniqueId: true,
    fetchRoomInfoOnConnect: false,
    wsClientHeaders: {
      Origin: 'https://www.tiktok.com',
      Referer: 'https://www.tiktok.com/'
    }
  })
}

function applyOverlayMode(enabled: boolean) {
  if (!mainWin || mainWin.isDestroyed()) {
    return
  }

  if (enabled) {
    if (platform.isWindows) {
      mainWin.setAlwaysOnTop(true, 'screen-saver')
    } else if (platform.isMacOS) {
      mainWin.setAlwaysOnTop(true, 'floating')
    } else {
      mainWin.setAlwaysOnTop(true)
    }

    mainWin.setIgnoreMouseEvents(true, { forward: true })
    return
  }

  mainWin.setAlwaysOnTop(false)
  mainWin.setIgnoreMouseEvents(false)
}

export const registerIPC = (win: BrowserWindow) => {
  // Atualizar referência da janela principal
  mainWin = win

  // Remover listeners antigos antes de criar novos
  ipcMain.removeAllListeners('setFullScreen')
  ipcMain.removeAllListeners('alwaysOnTop')
  ipcMain.removeAllListeners('set-overlay-mode')
  ipcMain.removeAllListeners('closeFilePreview')
  ipcMain.removeAllListeners('close')
  ipcMain.removeAllListeners('setIgnoreMouseEvents')
  ipcMain.removeAllListeners('open-config')

  // Remover handler anterior se existir
  ipcMain.removeHandler('get-system')
  ipcMain.removeHandler('tiktok-connect')
  ipcMain.removeHandler('tiktok-disconnect')

  ipcMain.handle('get-system', () => {
    return process.platform
  })

  ipcMain.handle('tiktok-connect', async (_event, rawChannel: string) => {
    const channel = rawChannel?.trim().replace(/^@/, '')
    const currentToken = ++tiktokConnectToken

    if (!channel) {
      return { success: false, error: 'Canal do TikTok inválido.' }
    }

    try {
      if (tiktokClient && tiktokChannel === channel) {
        return { success: true, alreadyConnected: true }
      }

      await disconnectTikTok()

      const bindChatListener = (client: TikTokLiveConnection) => {
        client.on(WebcastEvent.CHAT, (data: any) => {
          if (currentToken !== tiktokConnectToken || tiktokChannel !== channel) return

          sendTikTokChat({
            username: data?.nickname || data?.user?.nickname || 'TikTok',
            message: data?.comment || '',
            channel,
            timestamp: Date.now()
          })
        })
      }

      let client = createTikTokClient(channel, false)
      bindChatListener(client)
      tiktokClient = client
      tiktokChannel = channel

      let state
      try {
        state = await client.connect()
      } catch (firstError) {
        const message = firstError instanceof Error ? firstError.message : String(firstError)
        const shouldFallback = message.includes('Unexpected server response: 200')

        if (!shouldFallback) {
          throw firstError
        }

        console.warn(
          'TikTok WS retornou HTTP 200 na tentativa padrão, tentando fallback de conexão...'
        )

        try {
          await client.disconnect()
        } catch {
          // ignora erros de cleanup da tentativa inicial
        }
        client.removeAllListeners()

        client = createTikTokClient(channel, true)
        bindChatListener(client)
        tiktokClient = client
        tiktokChannel = channel
        state = await client.connect()
      }

      if (currentToken !== tiktokConnectToken || tiktokChannel !== channel) {
        try {
          await client.disconnect()
        } catch {
          // ignora erros ao encerrar conexão obsoleta
        }
        client.removeAllListeners()
        return { success: false, cancelled: true }
      }

      sendTikTokStatus({ status: 'connected', roomId: String(state.roomId ?? '') })

      return { success: true, roomId: state.roomId }
    } catch (error) {
      const friendlyMessage = getTikTokFriendlyErrorMessage(error)

      console.error('Erro ao conectar TikTok:', error)
      sendTikTokStatus({
        status: 'error',
        message: friendlyMessage
      })

      await disconnectTikTok()

      return {
        success: false,
        error: friendlyMessage
      }
    }
  })

  ipcMain.handle('tiktok-disconnect', async () => {
    tiktokConnectToken++
    await disconnectTikTok()
    return { success: true }
  })

  ipcMain.on('setFullScreen', (_event, showFullscreen: boolean) => {
    if (mainWin && !mainWin.isDestroyed()) {
      showFullscreen ? mainWin.maximize() : mainWin.unmaximize()
    }
  })

  ipcMain.on('alwaysOnTop', (_event, boolean: boolean) => {
    applyOverlayMode(boolean)
  })

  ipcMain.on('set-overlay-mode', (_event, enabled: boolean) => {
    applyOverlayMode(enabled)
  })

  ipcMain.on('closeFilePreview', () => {
    // Comportamento padrão: minimizar a janela
    if (mainWin && !mainWin.isDestroyed()) {
      mainWin.minimize()
    }
  })

  ipcMain.on('close', () => {
    if (mainWin && !mainWin.isDestroyed()) {
      mainWin.close()
    }
  })

  ipcMain.on('setIgnoreMouseEvents', (_event, value: boolean) => {
    if (mainWin && !mainWin.isDestroyed()) {
      mainWin.setIgnoreMouseEvents(value, value ? { forward: true } : undefined)
    }
  })

  ipcMain.on('open-config', () => {
    if (!configWin || configWin.isDestroyed()) {
      configWin = createConfigWindow()
      registerConfigIPC(configWin)

      configWin.on('closed', () => {
        configWin = null
      })
    } else {
      configWin.focus()
    }
  })

  // Remover handler anterior se existir
  ipcMain.removeHandler('get-config')

  // Registrar novo handler
  ipcMain.handle('get-config', async () => {
    const userDataPath = app.getPath('userData')
    const configDir = path.join(userDataPath, 'config')
    const saveConfigPath = configDir
    const configPath = path.join(saveConfigPath, 'config.json')

    try {
      if (!fs.existsSync(saveConfigPath)) {
        fs.mkdirSync(saveConfigPath, { recursive: true })
      }

      if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify(defaultConfigData, null, 2), 'utf8')
        return { success: true, data: defaultConfigData }
      }

      const json = fs.readFileSync(configPath, 'utf-8')
      const data = JSON.parse(json)

      if (!data.kick && !data.twitch && !data.youtube) {
        fs.writeFileSync(configPath, JSON.stringify(defaultConfigData, null, 2), 'utf8')
        return { success: true, data: defaultConfigData }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Erro desconhecido ao carregar configurações',
        data: defaultConfigData
      }
    }
  })

  // Remover handler anterior se existir
  ipcMain.removeHandler('fetch-youtube')

  // Handler para fazer requisições ao YouTube (sem restrições de CORS)
  ipcMain.handle('fetch-youtube', async (_event, url: string, payload?: string) => {
    try {
      const options: RequestInit = {
        method: payload ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      }

      if (payload) {
        options.body = payload
      }

      const response = await fetch(url, options)
      const contentType = response.headers.get('content-type') ?? ''
      const isJson = contentType.includes('application/json')

      if (!response.ok) {
        const errorBody = isJson ? await response.json() : await response.text()
        return {
          success: false,
          status: response.status,
          error: `HTTP ${response.status} ao acessar YouTube`,
          data: errorBody
        }
      }

      const data = isJson ? await response.json() : await response.text()
      return { success: true, data }
    } catch (error) {
      console.error('Erro ao fazer requisição ao YouTube:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
    }
  })

  ipcMain.removeHandler('fetch-twitch-api')

  ipcMain.handle('fetch-twitch-api', async (_event, url: string) => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      })

      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          error: `HTTP ${response.status}`
        }
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Erro ao fazer requisição à API Twitch:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
    }
  })

  // Handlers para o autoUpdater
  // Remover handlers anteriores se existirem
  ipcMain.removeHandler('check-for-updates')
  ipcMain.removeHandler('download-update')
  ipcMain.removeHandler('install-update')
  ipcMain.removeHandler('get-app-version')

  ipcMain.handle('check-for-updates', async () => {
    try {
      const result = await autoUpdater.checkForUpdates()
      return { success: true, result }
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
    }
  })

  ipcMain.handle('download-update', async () => {
    try {
      await autoUpdater.downloadUpdate()
      return { success: true }
    } catch (error) {
      console.error('Erro ao baixar atualização:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
    }
  })

  ipcMain.handle('install-update', async () => {
    try {
      autoUpdater.quitAndInstall()
      return { success: true }
    } catch (error) {
      console.error('Erro ao instalar atualização:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
    }
  })

  ipcMain.handle('get-app-version', () => {
    return app.getVersion()
  })

  // Remover listeners antigos do autoUpdater antes de criar novos
  autoUpdater.removeAllListeners('checking-for-update')
  autoUpdater.removeAllListeners('update-available')
  autoUpdater.removeAllListeners('update-not-available')
  autoUpdater.removeAllListeners('error')
  autoUpdater.removeAllListeners('download-progress')
  autoUpdater.removeAllListeners('update-downloaded')

  // Enviar eventos do updater para o renderer
  autoUpdater.on('checking-for-update', () => {
    if (mainWin && !mainWin.isDestroyed()) {
      mainWin.webContents.send('updater-checking-for-update')
    }
  })

  autoUpdater.on('update-available', (info) => {
    if (mainWin && !mainWin.isDestroyed()) {
      mainWin.webContents.send('updater-update-available', info)
    }
  })

  autoUpdater.on('update-not-available', (info) => {
    if (mainWin && !mainWin.isDestroyed()) {
      mainWin.webContents.send('updater-update-not-available', info)
    }
  })

  autoUpdater.on('error', (err) => {
    if (mainWin && !mainWin.isDestroyed()) {
      mainWin.webContents.send('updater-error', err.message)
    }
  })

  autoUpdater.on('download-progress', (progressObj) => {
    if (mainWin && !mainWin.isDestroyed()) {
      mainWin.webContents.send('updater-download-progress', progressObj)
    }
  })

  autoUpdater.on('update-downloaded', (info) => {
    if (mainWin && !mainWin.isDestroyed()) {
      mainWin.webContents.send('updater-update-downloaded', info)
    }
  })

  // Remover listener antigo antes de criar novo
  if (win && !win.isDestroyed()) {
    win.webContents.removeAllListeners('did-finish-load')
    win.webContents.on('did-finish-load', () => {
      if (mainWin && !mainWin.isDestroyed()) {
        mainWin.webContents.send('main-process-message', new Date().toLocaleString())
      }
    })

    // Limpar referência quando a janela for fechada
    win.on('closed', () => {
      if (mainWin === win) {
        mainWin = null
      }

      void disconnectTikTok()
    })
  }
}

// Função para obter a janela principal atual
export const getMainWindow = (): BrowserWindow | null => {
  return mainWin && !mainWin.isDestroyed() ? mainWin : null
}
