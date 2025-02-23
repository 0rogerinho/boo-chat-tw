// src/electron/ipc.ts

import { ipcMain, BrowserWindow, app } from 'electron'
import fs from 'fs'
import path from 'path'

export interface configDataProps {
  channel: string
}

export const registerConfigIPC = (win: BrowserWindow) => {
  if (!win) {
    return null
  }

  ipcMain.on('close-file-preview-config', () => {
    win?.minimize()
  })

  ipcMain.on('close-config', () => {
    win.close()
  })

  ipcMain.on('save-config', (_, data: configDataProps) => {
    const storeData = JSON.stringify(data, null, 2)
    const configDir = path.join(app.getPath('userData'), 'config')
    const configPath = path.join(configDir, 'config.json')

    try {
      // Garante que o diretório existe
      fs.mkdirSync(configDir, { recursive: true })

      // Se o arquivo não existir, cria com valores padrão
      if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify({ channel: '' }, null, 2), 'utf8')
      }

      // Salva os dados recebidos
      fs.writeFileSync(configPath, storeData, 'utf8')

      // Notifica todas as janelas abertas que o config foi atualizado
      BrowserWindow.getAllWindows().forEach((window) => {
        window.webContents.send('config-updated', data)
      })
    } catch (error) {
      console.error('Erro ao salvar o config.json:', error)
    }
  })

  return win
}
