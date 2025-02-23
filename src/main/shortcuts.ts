// src/electron/shortcuts.ts
import { globalShortcut, BrowserWindow } from 'electron';

export const registerShortcuts = (win: BrowserWindow) => {
  globalShortcut.register('control+alt+a', () => {
    win?.webContents.send('toggle-show-window');
  });
};
