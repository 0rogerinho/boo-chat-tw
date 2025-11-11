// src/electron/shortcuts.ts
import { globalShortcut, BrowserWindow } from 'electron'

export const registerShortcuts = (win: BrowserWindow) => {
  // Remover atalho antigo antes de registrar novo
  globalShortcut.unregister('control+alt+a')
  
  globalShortcut.register('control+alt+a', () => {
    if (win && !win.isDestroyed()) {
      win.webContents.send('toggle-show-window')
    }
  })
}
