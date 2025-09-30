import { app, BrowserWindow, dialog } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createHome } from './home'
import { registerIPC } from './home/ipc'
import { registerShortcuts } from './shortcuts'
import { createTray } from './tray'
import { autoUpdater } from 'electron-updater'

// Configurações do autoUpdater
autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = false

// Configurar logging para debug
const log = require('electron-log')
autoUpdater.logger = log
log.transports.file.level = 'info'

// Configurar URL base para atualizações (GitHub)
autoUpdater.setFeedURL({
  provider: 'github',
  owner: '0rogerinho',
  repo: 'boo-chat-tw'
})

// Eventos do autoUpdater
autoUpdater.on('checking-for-update', () => {
  console.log('Verificando atualizações...')
})

autoUpdater.on('update-available', (info) => {
  console.log('Atualização disponível:', info)
  dialog
    .showMessageBox({
      type: 'info',
      title: 'Atualização Disponível',
      message: 'Uma nova versão está disponível. Deseja baixar agora?',
      buttons: ['Baixar Agora', 'Depois']
    })
    .then((result) => {
      if (result.response === 0) {
        autoUpdater.downloadUpdate()
      }
    })
})

autoUpdater.on('update-not-available', (info) => {
  console.log('Nenhuma atualização disponível:', info)
})

autoUpdater.on('error', (err) => {
  console.error('Erro ao verificar atualizações:', err)
  dialog.showErrorBox('Erro de Atualização', 'Erro ao verificar atualizações: ' + err.message)
})

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = 'Velocidade de download: ' + progressObj.bytesPerSecond
  log_message = log_message + ' - Baixado ' + progressObj.percent + '%'
  log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')'
  console.log(log_message)
})

autoUpdater.on('update-downloaded', (info) => {
  console.log('Atualização baixada:', info)
  dialog
    .showMessageBox({
      type: 'info',
      title: 'Atualização Baixada',
      message:
        'A atualização foi baixada. O aplicativo será reiniciado para aplicar a atualização.',
      buttons: ['Reiniciar Agora', 'Depois']
    })
    .then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall()
      }
    })
})

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

  // Verificar atualizações após 5 segundos (apenas em produção)
  if (process.env.NODE_ENV === 'production') {
    setTimeout(() => {
      console.log('Iniciando verificação de atualizações...')
      autoUpdater.checkForUpdatesAndNotify()
    }, 5000)
  } else {
    console.log('Modo desenvolvimento - verificação de atualizações desabilitada')
  }

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

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
