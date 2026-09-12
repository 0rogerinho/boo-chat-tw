import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createHome } from './home'
import { getMainWindow, registerIPC } from './home/ipc'
import { registerShortcuts } from './shortcuts'
import { createTray } from './tray'
import { platform } from './platform'
import { startOverlayServer, stopOverlayServer } from './overlay/server'
import { setupAutoUpdater } from './updater'

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.devrogerinho.boochat')

  // Configurar ícone do Dock no Mac (deve ser feito antes de criar a janela)
  if (platform.isMacOS) {
    const dockIcon = platform.getDockIcon()
    if (dockIcon) {
      app.dock.setIcon(dockIcon)
    } else {
      console.warn('[Index] Não foi possível configurar o ícone do Dock')
    }
  }

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  const win = createHome()
  // Criar o tray ANTES de registrar IPC para garantir que sempre apareça
  try {
    createTray(win)
  } catch (error) {
    console.error('[Index] ❌ Erro ao criar tray:', error)
  }
  registerIPC(win)
  setupAutoUpdater(getMainWindow)

  registerShortcuts(win)

  void startOverlayServer().then(() => {
    try {
      createTray(win)
    } catch (error) {
      console.error('[Index] ❌ Erro ao atualizar tray após overlay:', error)
    }
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      const newWin = createHome()
      createTray(newWin)
      registerIPC(newWin)
      registerShortcuts(newWin)
      void startOverlayServer()
    } else {
      // Se a janela existe mas está escondida, mostra ela
      const existingWin = BrowserWindow.getAllWindows()[0]
      if (existingWin && !existingWin.isVisible()) {
        existingWin.show()
        app.dock?.show()
      }
    }
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  stopOverlayServer()
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
