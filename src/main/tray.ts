import { Tray, Menu, app, BrowserWindow, nativeImage } from 'electron'
import { platform } from './platform'

let tray: Tray | null = null

export function createTray(win: BrowserWindow) {
  // Destruir tray existente se houver
  if (tray && !tray.isDestroyed()) {
    tray.destroy()
    tray = null
  }

  try {
    const iconPath = platform.getTrayIcon()
    let trayImage: string | ReturnType<typeof nativeImage.createFromPath>

    if (platform.isMacOS) {
      // No Mac, processar a imagem (redimensionar para 22x22px)
      const image = nativeImage.createFromPath(iconPath)
      if (image.isEmpty()) {
        throw new Error(`Não foi possível carregar o ícone do tray de: ${iconPath}`)
      }

      const size = image.getSize()

      // No macOS, o tamanho recomendado é 22x22 pixels (ou múltiplos para retina)
      // Para suporte a retina, usar 44x44 (2x)
      const targetSize = 16
      const finalSize = targetSize

      if (size.width !== finalSize || size.height !== finalSize) {
        trayImage = image.resize({
          width: finalSize,
          height: finalSize,
          quality: 'best'
        })
      } else {
        trayImage = image
      }

      // No macOS, os ícones de tray devem ser template images para funcionar corretamente
      // Isso permite que o sistema ajuste automaticamente a cor baseado no tema (claro/escuro)
      // IMPORTANTE: Template images funcionam melhor com imagens em preto/transparente
      try {
        trayImage.setTemplateImage(true)
        console.log('[Tray] Template image definido como true')
      } catch (error) {
        console.warn('[Tray] Erro ao definir template image, continuando sem template:', error)
        // Continuar sem template se houver erro
      }
    } else {
      trayImage = iconPath
    }

    tray = new Tray(trayImage)

    if (platform.isMacOS) {
      tray.setIgnoreDoubleClickEvents(true)
    }

    setupTrayEvents(win)
    updateTrayMenu(win)
    tray.setToolTip('BooChat')

    return tray
  } catch (error) {
    console.error('[Tray] Erro ao criar tray:', error)
    // Criar tray com imagem vazia como fallback
    tray = new Tray(nativeImage.createEmpty())
    updateTrayMenu(win)
    tray.setToolTip('BooChat')
    return tray
  }
}

function setupTrayEvents(win: BrowserWindow) {
  if (!tray) return

  // Remover listeners antigos antes de criar novos
  tray.removeAllListeners('click')

  // No Mac, o clique simples já mostra o menu de contexto automaticamente
  // Não precisamos adicionar o evento de click no Mac
  if (!platform.isMacOS) {
    tray.on('click', () => {
      if (win && !win.isDestroyed()) {
        if (win.isVisible()) {
          win.hide()
        } else {
          win.show()
        }
      }
    })
  }
}

function updateTrayMenu(win: BrowserWindow) {
  if (!tray) return

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Esconder/aparecer',
      click: () => {
        if (win && !win.isDestroyed()) {
          win.webContents.send('toggle-show-window')
        }
      }
    },
    {
      label: 'Minimizar',
      click: () => {
        if (win && !win.isDestroyed()) {
          if (platform.isMacOS) {
            win.hide()
            setTimeout(() => app.dock?.hide(), 100)
          } else {
            win.minimize()
          }
        }
      }
    },
    {
      label: 'Abrir janela',
      click: () => {
        if (win && !win.isDestroyed()) {
          win.show()
          if (platform.isMacOS) {
            app.dock?.show()
          }
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
