import { app, BrowserWindow, ipcMain } from 'electron'
import log from 'electron-log/main'
import { autoUpdater } from 'electron-updater'

let configured = false

function sendToWindow(
  getWindow: () => BrowserWindow | null,
  channel: string,
  ...args: unknown[]
) {
  const window = getWindow()
  if (window && !window.isDestroyed()) {
    window.webContents.send(channel, ...args)
  }
}

export function setupAutoUpdater(getWindow: () => BrowserWindow | null) {
  if (configured) return
  configured = true

  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true
  autoUpdater.logger = log
  log.transports.file.level = 'info'

  autoUpdater.setFeedURL({
    provider: 'github',
    owner: '0rogerinho',
    repo: 'boo-chat-tw'
  })

  autoUpdater.on('checking-for-update', () => {
    sendToWindow(getWindow, 'updater-checking-for-update')
  })

  autoUpdater.on('update-available', (info) => {
    sendToWindow(getWindow, 'updater-update-available', info)
  })

  autoUpdater.on('update-not-available', (info) => {
    sendToWindow(getWindow, 'updater-update-not-available', info)
  })

  autoUpdater.on('error', (error) => {
    log.error('[updater]', error)
    sendToWindow(getWindow, 'updater-error', error.message)
  })

  autoUpdater.on('download-progress', (progress) => {
    sendToWindow(getWindow, 'updater-download-progress', progress)
  })

  autoUpdater.on('update-downloaded', (info) => {
    sendToWindow(getWindow, 'updater-update-downloaded', info)
  })

  ipcMain.removeHandler('check-for-updates')
  ipcMain.removeHandler('download-update')
  ipcMain.removeHandler('install-update')

  ipcMain.handle('check-for-updates', async () => {
    try {
      const result = await autoUpdater.checkForUpdates()
      return { success: true, result }
    } catch (error) {
      log.error('[updater] check failed', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  })

  ipcMain.handle('download-update', async () => {
    try {
      await autoUpdater.downloadUpdate()
      return { success: true }
    } catch (error) {
      log.error('[updater] download failed', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  })

  ipcMain.handle('install-update', async () => {
    try {
      autoUpdater.quitAndInstall()
      return { success: true }
    } catch (error) {
      log.error('[updater] install failed', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  })

  if (!app.isPackaged) {
    log.info('[updater] Ignorado: o app não está empacotado')
    return
  }

  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((error) => {
      log.error('[updater] check on startup failed', error)
    })
  }, 5000)
}
