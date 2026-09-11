import fs from 'fs'
import path from 'path'
import { app } from 'electron'
import { defaultConfigData } from '../shared/mocks'

export function getConfigFilePath(): string {
  const userDataPath = app.getPath('userData')
  const configDir = path.join(userDataPath, 'config')
  return path.join(configDir, 'config.json')
}

export function loadAppConfig(): { success: boolean; data: unknown; error?: string } {
  const configPath = getConfigFilePath()
  const configDir = path.dirname(configPath)

  try {
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true })
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
      error: error instanceof Error ? error.message : 'Erro desconhecido ao carregar configurações',
      data: defaultConfigData
    }
  }
}
