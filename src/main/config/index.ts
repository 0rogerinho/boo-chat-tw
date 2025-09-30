import { is } from '@electron-toolkit/utils'
import { BrowserWindow } from 'electron'
import { join } from 'node:path'

export function createConfigWindow() {
  let win = new BrowserWindow({
    width: 400,
    height: 500,
    title: 'Configurações',
    resizable: false,
    parent: BrowserWindow.getAllWindows()[0], // Define como filha da principal
    modal: true,
    frame: false,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/#/config')
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'config' })
  }

  win.once('ready-to-show', () => {
    win?.show()
  })

  win.on('closed', () => {})

  return win
}
