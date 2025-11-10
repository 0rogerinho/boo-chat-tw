import { Tray, Menu, app, BrowserWindow, nativeImage, NativeImage } from 'electron'
import { platform } from './platform'

import fs from 'fs'

let tray: Tray | null = null

export function createTray(win: BrowserWindow) {
  // Se o tray já existe e não foi destruído, apenas atualiza a referência da janela
  if (tray && !tray.isDestroyed()) {
    // Atualiza o menu do tray com a nova referência da janela
    updateTrayMenu(win)
    return tray
  }

  const trayImagePath = platform.getTrayIcon()

  // Verificar se o arquivo existe
  if (!fs.existsSync(trayImagePath)) {
    console.error('Ícone do tray não encontrado:', trayImagePath)
    // Tentar usar um ícone padrão ou criar um ícone vazio
  }

  // No Mac, usar nativeImage para garantir melhor compatibilidade
  let trayImage: string | NativeImage
  if (platform.isMacOS) {
    const image = nativeImage.createFromPath(trayImagePath)
    // Se a imagem não foi carregada, criar uma imagem vazia
    if (image.isEmpty()) {
      console.warn('Não foi possível carregar o ícone do tray, usando imagem padrão')
      trayImage = trayImagePath // Fallback para o caminho
    } else {
      // No Mac, usar template image para melhor integração
      image.setTemplateImage(true)
      trayImage = image
    }
  } else {
    trayImage = trayImagePath
  }

  tray = new Tray(trayImage)

  // No Mac, garantir que o tray sempre apareça
  if (platform.isMacOS) {
    tray.setIgnoreDoubleClickEvents(true)
  }

  win?.webContents.send('toggle-show-window')

  updateTrayMenu(win)

  tray.setToolTip('BooChat')

  // Garantir que o tray seja sempre visível
  if (platform.isMacOS) {
    // No Mac, o tray deve sempre aparecer na menu bar
    // Não esconder a dock imediatamente - deixar o tray aparecer primeiro
    console.log('Tray criado no Mac - deve aparecer na menu bar')
  }

  // No Mac, usar apenas o menu de contexto (clique direito)
  // No Windows/Linux, usar clique para mostrar/esconder
  if (platform.isMacOS) {
    // No Mac, apenas o menu de contexto
    tray.on('click', () => {
      // No Mac, o clique abre o menu de contexto automaticamente
      // Mas podemos também alternar a janela
      if (win.isVisible()) {
        win.hide()
        setTimeout(() => {
          app.dock?.hide()
        }, 100)
      } else {
        win.show()
        app.dock?.show()
      }
    })
  } else {
    // No Windows/Linux, clique alterna mostrar/esconder
    tray.on('click', () => {
      if (win.isVisible()) {
        win.hide()
      } else {
        win.show()
      }
    })
  }

  return tray
}

function updateTrayMenu(win: BrowserWindow) {
  if (!tray) return

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Esconder/aparecer',
      click: () => win?.webContents.send('toggle-show-window')
    },
    {
      label: 'Minimizar',
      click: () => {
        if (platform.isMacOS) {
          // No Mac, esconde a janela e vai para o tray
          win.hide()
          // Aguardar um pouco antes de esconder a dock para garantir que o tray apareça
          setTimeout(() => {
            app.dock?.hide()
          }, 100)
        } else {
          win.minimize()
        }
      }
    },
    {
      label: 'Abrir janela',
      click: () => {
        win.show()
        if (platform.isMacOS) {
          app.dock?.show()
        }
      }
    },
    {
      label: 'Sair',
      click: () => {
        tray?.destroy()
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)
}
