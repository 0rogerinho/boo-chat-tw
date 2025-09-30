import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'
import { createHome } from './home'
import { registerIPC } from './home/ipc'
import { registerShortcuts } from './shortcuts'
import { createTray } from './tray'

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  const win = createHome()
  createTray(win) // 👈 aqui adiciona a bandeja
  registerIPC(win)

  registerShortcuts(win)

  // Configurar auto-updater
  setupAutoUpdater(win)

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createHome()
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

// Configuração do auto-updater
function setupAutoUpdater(win: BrowserWindow) {
  // Configurar para verificar atualizações automaticamente
  autoUpdater.checkForUpdatesAndNotify()

  // Eventos do auto-updater
  autoUpdater.on('checking-for-update', () => {
    console.log('Verificando atualizações...')
  })

  autoUpdater.on('update-available', (info) => {
    console.log('Atualização disponível:', info.version)
    // Enviar notificação para o renderer
    win.webContents.send('update-available', info)
  })

  autoUpdater.on('update-not-available', (info) => {
    console.log('Nenhuma atualização disponível:', info.version)
  })

  autoUpdater.on('error', (err) => {
    console.error('Erro ao verificar atualizações:', err)
  })

  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = 'Velocidade de download: ' + progressObj.bytesPerSecond
    log_message = log_message + ' - Baixado ' + progressObj.percent + '%'
    log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')'
    console.log(log_message)

    // Enviar progresso para o renderer
    win.webContents.send('download-progress', progressObj)
  })

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Atualização baixada:', info.version)
    // Enviar notificação para o renderer
    win.webContents.send('update-downloaded', info)
  })

  // Verificar atualizações a cada 4 horas
  setInterval(
    () => {
      autoUpdater.checkForUpdatesAndNotify()
    },
    4 * 60 * 60 * 1000
  ) // 4 horas em millisegundos
}

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
