// src/electron/ipc.ts
import fs from 'fs'
import { ipcMain, BrowserWindow, app } from 'electron'
import { createConfigWindow } from '../config'
import { registerConfigIPC } from '../config/ipc'
import path from 'path'
import { is } from '@electron-toolkit/utils'
import { defaultConfigData } from '../shared/mocks'
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
    // paths
    const exePath = path.join(app.getPath('exe'), 'config')
    const dirnamePath = path.join(__dirname, '..', '..', 'config')

    // save config path
    const saveConfigPath = path.join(is.dev ? dirnamePath : exePath)

    const configPath = path.join(saveConfigPath, 'config.json')

    try {
      if (!fs.existsSync(saveConfigPath)) {
        fs.mkdirSync(saveConfigPath, { recursive: true })
      }

      if (fs.existsSync(configPath)) {
        const json = fs.readFileSync(configPath, 'utf-8')
        const data = JSON.parse(json)

        const configData = data

        if (!data.kick && !data.twitch && !data.youtube) {
          fs.writeFileSync(configPath, JSON.stringify(defaultConfigData, null, 2), 'utf8')

          return configData
        }

        return configData
      }
    } catch (error) {
      console.log(error)
    }
  })

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

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })
}
