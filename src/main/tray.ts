import { Tray, Menu, app, BrowserWindow } from 'electron'
import trayImage from '../../resources/icon.png?asset'

let tray: Tray | null = null

export function createTray(win: BrowserWindow) {
  if (tray) return // Evita múltiplas bandejas em modo dev

  tray = new Tray(trayImage)
  win?.webContents.send('toggle-show-window')
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Esconder/aparecer',
      click: () => win?.webContents.send('toggle-show-window')
    },
    {
      label: 'Minimizar',
      click: () => win.minimize()
    },
    {
      label: 'Abrir janela',
      click: () => win.show()
    },
    {
      label: 'Sair',
      click: () => {
        tray?.destroy()
        app.quit()
      }
    }
  ])

  tray.setToolTip('Seu App')
  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    win.show()
  })
}
