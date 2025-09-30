// src/electron/ipc.ts

import { ipcMain, BrowserWindow, app } from 'electron'
import fs from 'fs'
import path from 'path'
import { defaultConfigData } from '../shared/mocks'

export interface configDataProps {
  kick: { slug: string; id?: number; user_id?: number }
  twitch: { channel: string }
  youtube: { channelName: string; channelId?: string }
  font: {
    size: number
    weight: number
  }
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
  ipcMain.removeHandler('save-config')

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

  ipcMain.handle('save-config', async (_, data: configDataProps) => {
    console.log('Recebendo dados para salvar:', data)

    // Usa o diretório de dados do usuário para salvar configurações
    const userDataPath = app.getPath('userData')
    const configDir = path.join(userDataPath, 'config')

    // store data
    const storeData = JSON.stringify(data, null, 2)
    console.log('Dados serializados:', storeData)

    // save config path
    const saveConfigPath = configDir
    console.log('Caminho para salvar:', saveConfigPath)

    try {
      // Garante que o diretório existe
      fs.mkdirSync(saveConfigPath, { recursive: true })
      console.log('Diretório criado/verificado:', saveConfigPath)

      // Se o arquivo não existir, cria com valores padrão
      if (!fs.existsSync(path.join(saveConfigPath, 'config.json'))) {
        console.log('Arquivo não existe, criando com dados padrão')
        fs.writeFileSync(
          path.join(saveConfigPath, 'config.json'),
          JSON.stringify(defaultConfigData, null, 2),
          'utf8'
        )
      }

      // Salva os dados recebidos
      const configFilePath = path.join(saveConfigPath, 'config.json')
      console.log('Salvando em:', configFilePath)
      fs.writeFileSync(configFilePath, storeData, 'utf8')
      console.log('Arquivo salvo com sucesso')

      // Notifica todas as janelas abertas que o config foi atualizado
      BrowserWindow.getAllWindows().forEach((window) => {
        if (!window.isDestroyed()) {
          window.webContents.send('config-updated', data)
        }
      })
      console.log('Notificações enviadas para todas as janelas')

      // Fecha a janela de configurações após salvar com sucesso
      if (!win.isDestroyed()) {
        win.close()
      }

      return { success: true, message: 'Configurações salvas com sucesso!' }
    } catch (error) {
      console.error('Erro ao salvar o config.json:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao salvar configurações'
      }
    }
  })

  return win
}
