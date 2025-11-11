import fs from 'fs'
import { BrowserWindow, shell, app } from 'electron'
import path, { join } from 'node:path'
import { is } from '@electron-toolkit/utils'
import { platform } from '../platform'

export const createHome = (): BrowserWindow => {
  // Usa o diretório de dados do usuário para salvar configurações
  const userDataPath = app.getPath('userData')
  const configDir = path.join(userDataPath, 'config')
  const configPath = path.join(configDir, 'config.json')

  // Função para carregar a configuração salva
  function loadConfig() {
    if (fs.existsSync(configPath)) {
      const json = fs.readFileSync(configPath, 'utf-8')
      return JSON.parse(json)
    }
    return {} // Retorna um objeto vazio caso não exista
  }

  // Função para salvar a configuração
  function saveConfig(data: object) {
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true })
    }
    fs.writeFileSync(configPath, JSON.stringify(data))
  }

  // Carrega a última posição e tamanho salvos
  const lastBounds = loadConfig() || {
    x: 800,
    y: 80,
    width: 400,
    height: 400
  }

  const platformConfig = platform.getPlatformSpecificConfig()
  const currentPlatformConfig = platform.isWindows
    ? platformConfig.windows
    : platform.isMacOS
      ? platformConfig.macos
      : platformConfig.linux

  const win = new BrowserWindow({
    width: lastBounds.width,
    height: lastBounds.height,
    x: lastBounds.x,
    y: lastBounds.y,
    fullscreen: false,
    show: false,
    ...currentPlatformConfig,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  win.on('ready-to-show', () => {
    win.show()
  })

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  win.webContents.on('did-fail-load', (_, errorCode, errorDescription) => {
    console.error(`Erro ao carregar a página: ${errorCode} - ${errorDescription}`)
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Comportamento padrão do macOS para minimizar e fechar

  win.on('close', () => {
    const bounds = win.getBounds()
    const newConfig = { ...loadConfig(), ...bounds }
    saveConfig(newConfig)
  })

  return win
}
