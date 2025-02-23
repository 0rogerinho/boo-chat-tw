// src/electron/ipc.ts
import fs from 'fs'
import { ipcMain, BrowserWindow, app } from 'electron'
import { createConfigWindow } from '../config'
import { registerConfigIPC } from '../config/ipc'
import path from 'path'
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
    if (!configWin) {
      configWin = createConfigWindow()
      registerConfigIPC(configWin)

      configWin.on('closed', () => {
        configWin = null
        ipcMain.removeAllListeners('close-config')
        ipcMain.removeAllListeners('save-config')
        ipcMain.removeAllListeners('close-file-preview-config')
      })
    } else {
      configWin.focus()
    }
  })

  // Remover handler anterior se existir
  ipcMain.removeHandler('get-config')

  // Registrar novo handler
  ipcMain.handle('get-config', async () => {
    console.log('get-config chamado')
    const configDir = path.join(app.getPath('userData'), 'config')
    const configPath = path.join(configDir, 'config.json')

    try {
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true })
      }

      if (fs.existsSync(configPath)) {
        const json = fs.readFileSync(configPath, 'utf-8')
        return JSON.parse(json)
      } else {
        console.warn('Arquivo config.json não encontrado')
        return null
      }
    } catch (error) {
      console.error('Erro ao acessar config.json:', error)
      return null
    }
  })

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })
}
