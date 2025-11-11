import { app, nativeImage, NativeImage } from 'electron'
import path from 'path'
import fs from 'fs'

function getAppPath(): string {
  return app.isPackaged ? (process as any).resourcesPath || app.getAppPath() : app.getAppPath()
}

function findFile(possiblePaths: string[]): string {
  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      // Verificar se o arquivo não está vazio
      const stats = fs.statSync(filePath)
      if (stats.size > 0) {
        return filePath
      }
    }
  }
  throw new Error(`Arquivo não encontrado em nenhum dos caminhos: ${possiblePaths.join(', ')}`)
}

export const platform = {
  isWindows: process.platform === 'win32',
  isMacOS: process.platform === 'darwin',
  isLinux: process.platform === 'linux',

  getIconPath(): string {
    const appPath = getAppPath()

    if (this.isWindows) {
      return path.join(appPath, 'icon.ico')
    }

    if (this.isMacOS) {
      // Tentar encontrar icon.icns primeiro
      const icnsPaths = app.isPackaged
        ? [
            path.join(appPath, 'build', 'icon.icns'),
            path.join(appPath, '..', 'app.asar.unpacked', 'build', 'icon.icns'),
            path.join(appPath, 'icon.icns')
          ]
        : [
            path.join(__dirname, '../../build/icon.icns'),
            path.join(process.cwd(), 'build/icon.icns'),
            path.join(app.getAppPath(), 'build', 'icon.icns')
          ]

      // Verificar se algum icns existe e não está vazio
      for (const icnsPath of icnsPaths) {
        if (fs.existsSync(icnsPath)) {
          const stats = fs.statSync(icnsPath)
          if (stats.size > 0) {
            return icnsPath
          }
        }
      }

      // Se não encontrou icns válido, usar PNG como fallback
      const pngPaths = app.isPackaged
        ? [
            path.join(appPath, 'build', 'icon.png'),
            path.join(appPath, '..', 'app.asar.unpacked', 'build', 'icon.png'),
            path.join(appPath, 'resources', 'icon.png')
          ]
        : [
            path.join(__dirname, '../../build/icon.png'),
            path.join(__dirname, '../../resources/icon.png'),
            path.join(process.cwd(), 'build/icon.png'),
            path.join(process.cwd(), 'resources/icon.png'),
            path.join(app.getAppPath(), 'build', 'icon.png'),
            path.join(app.getAppPath(), 'resources', 'icon.png')
          ]

      return findFile(pngPaths)
    }

    return path.join(appPath, 'build', 'icon.png')
  },

  getAppName(): string {
    return app.getName()
  },

  getAppVersion(): string {
    return app.getVersion()
  },

  getAppId(): string {
    return app.isPackaged ? 'com.devrogerinho.boochat' : 'com.devrogerinho.boochat.dev'
  },

  getTrayIcon(): string {
    if (this.isMacOS) {
      const devPaths = [
        path.join(__dirname, '../../resources/icon-mac.png'),
        path.join(process.cwd(), 'resources/icon-mac.png'),
        path.join(app.getAppPath(), 'resources', 'icon-mac.png')
      ]

      if (app.isPackaged) {
        // Em produção, usar process.resourcesPath que aponta para Contents/Resources
        const resourcesPath = (process as any).resourcesPath || path.join(app.getAppPath(), '..')
        console.log('[Platform] resourcesPath:', resourcesPath)
        console.log('[Platform] app.getAppPath():', app.getAppPath())
        const prodPaths = [
          path.join(resourcesPath, 'app.asar.unpacked', 'resources', 'icon-mac.png'),
          path.join(resourcesPath, 'resources', 'icon-mac.png'),
          path.join(app.getAppPath(), '..', 'app.asar.unpacked', 'resources', 'icon-mac.png'),
          path.join(app.getAppPath(), '..', 'resources', 'icon-mac.png')
        ]
        console.log('[Platform] Tentando encontrar ícone do tray nos caminhos:', prodPaths)
        return findFile(prodPaths)
      }

      return findFile(devPaths)
    }

    // Windows/Linux
    if (app.isPackaged) {
      const resourcesPath = (process as any).resourcesPath || path.join(app.getAppPath(), '..')
      const iconPath = path.join(resourcesPath, 'app.asar.unpacked', 'resources', 'icon.png')
      if (fs.existsSync(iconPath)) {
        return iconPath
      }
      // Fallback para dentro do asar
      return path.join(resourcesPath, 'resources', 'icon.png')
    }

    return path.join(__dirname, '../../resources/icon.png')
  },

  getWindowIcon(): string | NativeImage {
    const iconPath = this.getIconPath()

    // No Mac, sempre retornar NativeImage para garantir compatibilidade
    if (this.isMacOS) {
      const image = nativeImage.createFromPath(iconPath)
      if (!image.isEmpty()) {
        return image
      }
      // Se falhar, tentar criar uma imagem vazia como fallback
      console.warn(`[Platform] Não foi possível carregar o ícone de ${iconPath}`)
    }

    return iconPath
  },

  getDockIcon(): NativeImage | null {
    if (!this.isMacOS) {
      return null
    }

    try {
      const iconPath = this.getIconPath()
      const image = nativeImage.createFromPath(iconPath)
      if (!image.isEmpty()) {
        return image
      }
    } catch (error) {
      console.error('[Platform] Erro ao carregar ícone do Dock:', error)
    }

    return null
  },

  isDev(): boolean {
    return !app.isPackaged
  },

  getPlatformSpecificConfig() {
    const icon = this.getWindowIcon()
    const baseConfig = {
      frame: false,
      transparent: true,
      autoHideMenuBar: false,
      icon
    }

    return {
      windows: baseConfig,
      macos: baseConfig,
      linux: baseConfig
    }
  }
}
