// src/electron/ipc.ts
import fs from 'fs'
import { ipcMain, BrowserWindow, app } from 'electron'
import { createConfigWindow } from '../config'
import { registerConfigIPC } from '../config/ipc'
import path from 'path'
import { defaultConfigData } from '../shared/mocks'
import { autoUpdater } from 'electron-updater'
export type configData = {
  channel: string
}

let configWin: BrowserWindow | null = null

export const registerIPC = (win: BrowserWindow) => {
  ipcMain.on('setFullScreen', (_event, showFullscreen: boolean) => {
    showFullscreen ? win.maximize() : win.unmaximize()
  })

  ipcMain.on('alwaysOnTop', (_event, boolean: boolean) => {
    win?.setAlwaysOnTop(boolean)
  })

  ipcMain.on('closeFilePreview', () => {
    win?.minimize()
  })

  ipcMain.on('close', () => {
    win?.close()
  })

  ipcMain.on('setIgnoreMouseEvents', (_event, value: boolean) => {
    win?.setIgnoreMouseEvents(value)
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
    console.log('Handler get-config chamado')

    // Usa o diretório de dados do usuário para carregar configurações
    const userDataPath = app.getPath('userData')
    const configDir = path.join(userDataPath, 'config')

    // save config path
    const saveConfigPath = configDir
    console.log('Caminho para carregar:', saveConfigPath)

    const configPath = path.join(saveConfigPath, 'config.json')
    console.log('Arquivo de configuração:', configPath)

    try {
      // Garante que o diretório existe
      if (!fs.existsSync(saveConfigPath)) {
        console.log('Diretório não existe, criando:', saveConfigPath)
        fs.mkdirSync(saveConfigPath, { recursive: true })
      }

      // Se o arquivo não existe, cria com dados padrão
      if (!fs.existsSync(configPath)) {
        console.log('Arquivo não existe, criando com dados padrão')
        fs.writeFileSync(configPath, JSON.stringify(defaultConfigData, null, 2), 'utf8')
        console.log('Arquivo criado com dados padrão:', defaultConfigData)
        return { success: true, data: defaultConfigData }
      }

      // Se o arquivo existe, tenta carregar
      console.log('Arquivo existe, carregando...')
      const json = fs.readFileSync(configPath, 'utf-8')
      const data = JSON.parse(json)
      console.log('Dados carregados do arquivo:', data)

      // Verifica se o arquivo tem as propriedades necessárias
      if (!data.kick && !data.twitch && !data.youtube) {
        console.log('Arquivo inválido, recriando com dados padrão')
        fs.writeFileSync(configPath, JSON.stringify(defaultConfigData, null, 2), 'utf8')
        return { success: true, data: defaultConfigData }
      }

      console.log('Retornando dados válidos:', data)
      return { success: true, data }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      // Em caso de erro, retorna dados padrão com indicação de erro
      console.log('Retornando dados padrão devido ao erro')
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

      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json()
        return { success: true, data }
      } else {
        const html = await response.text()
        return { success: true, data: html }
      }
    } catch (error) {
      console.error('Erro ao fazer requisição ao YouTube:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
    }
  })

  // Handlers para o autoUpdater
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

  // Enviar eventos do updater para o renderer
  autoUpdater.on('checking-for-update', () => {
    win?.webContents.send('updater-checking-for-update')
  })

  autoUpdater.on('update-available', (info) => {
    win?.webContents.send('updater-update-available', info)
  })

  autoUpdater.on('update-not-available', (info) => {
    win?.webContents.send('updater-update-not-available', info)
  })

  autoUpdater.on('error', (err) => {
    win?.webContents.send('updater-error', err.message)
  })

  autoUpdater.on('download-progress', (progressObj) => {
    win?.webContents.send('updater-download-progress', progressObj)
  })

  autoUpdater.on('update-downloaded', (info) => {
    win?.webContents.send('updater-update-downloaded', info)
  })

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })
}
