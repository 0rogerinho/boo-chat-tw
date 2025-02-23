import fs from 'fs'
import { BrowserWindow, shell } from 'electron'
import path, { join } from 'node:path'
import { is } from '@electron-toolkit/utils'
import icon from '../../../resources/icon.png?asset'

export const createHome = (): BrowserWindow => {
  const configPath = 'config/config.json'

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
    const dir = path.dirname(configPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
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

  const win = new BrowserWindow({
    width: lastBounds.width,
    height: lastBounds.height,
    x: lastBounds.x,
    y: lastBounds.y,
    frame: false,
    fullscreen: false,
    transparent: true,
    show: false,
    autoHideMenuBar: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
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

  win.on('close', () => {
    const bounds = win.getBounds()
    const newConfig = { ...loadConfig(), ...bounds }
    saveConfig(newConfig)
  })

  return win
}
