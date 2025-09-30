// src/electron/ipc.ts

import { is } from '@electron-toolkit/utils'
import { ipcMain, BrowserWindow, app } from 'electron'
import fs from 'fs'
import path from 'path'
import { defaultConfigData } from '../shared/mocks'

export interface configDataProps {
  kick: { slug: string; id?: number; user_id?: number }
  twitch: { channel: string }
  x: number
  y: number
  width: number
  height: number
}

export const registerConfigIPC = (win: BrowserWindow) => {
  if (!win) {
    return null
  }

  // Remove listeners existentes para evitar duplicação
  ipcMain.removeAllListeners('close-file-preview-config')
  ipcMain.removeAllListeners('close-config')
  ipcMain.removeAllListeners('save-config')

  ipcMain.on('close-file-preview-config', () => {
    if (!win.isDestroyed()) {
      win.minimize()
    }
  })

  ipcMain.on('close-config', () => {
    if (!win.isDestroyed()) {
      win.close()
    }
  })

  ipcMain.on('save-config', (_, data: configDataProps) => {
    // paths
    const exePath = path.join(app.getPath('exe'), 'config')
    const dirnamePath = path.join(__dirname, '..', '..', 'config')

    // store data
    const storeData = JSON.stringify(data, null, 2)

    // save config path
    const saveConfigPath = path.join(is.dev ? dirnamePath : exePath)

    try {
      // Garante que o diretório existe
      fs.mkdirSync(saveConfigPath, { recursive: true })

      // Se o arquivo não existir, cria com valores padrão
      if (!fs.existsSync(saveConfigPath)) {
        fs.writeFileSync(
          path.join(saveConfigPath, 'config.json'),
          JSON.stringify(defaultConfigData, null, 2),
          'utf8'
        )
      }

      // Salva os dados recebidos
      fs.writeFileSync(path.join(saveConfigPath, 'config.json'), storeData, 'utf8')

      // Notifica todas as janelas abertas que o config foi atualizado
      BrowserWindow.getAllWindows().forEach((window) => {
        if (!window.isDestroyed()) {
          window.webContents.send('config-updated', data)
        }
      })

      // Fecha a janela de configurações após salvar com sucesso
      if (!win.isDestroyed()) {
        win.close()
      }
    } catch (error) {
      console.error('Erro ao salvar o config.json:', error)
    }
  })

  return win
}
