/// <reference types="vite/client" />

interface Window {
  electron: {
    ipcRenderer: {
      invoke(channel: string, ...args: any[]): Promise<any>
      send(channel: string, ...args: any[]): void
      on(channel: string, callback: (...args: any[]) => void): void
      removeListener(channel: string, callback: (...args: any[]) => void): void
      removeAllListeners(channel: string): void
    }
  }
  api: {
    fetchYouTube: (url: string, payload?: string) => Promise<any>
    fetchTwitchApi: (url: string) => Promise<{ success: boolean; data?: any; error?: string; status?: number }>
    connectTikTok: (channel: string) => Promise<{ success: boolean; error?: string; roomId?: string }>
    disconnectTikTok: () => Promise<{ success: boolean }>
    onTikTokStatus: (
      callback: (payload: { status: 'connected' | 'disconnected' | 'error'; message?: string; roomId?: string }) => void
    ) => () => void
    onTikTokChat: (
      callback: (payload: { username: string; message: string; channel: string; timestamp: number }) => void
    ) => () => void
    checkForUpdates: () => Promise<any>
    downloadUpdate: () => Promise<any>
    installUpdate: () => Promise<void>
    getAppVersion: () => Promise<string>
    onUpdaterCheckingForUpdate: (callback: () => void) => void
    onUpdaterUpdateAvailable: (callback: (info: any) => void) => void
    onUpdaterUpdateNotAvailable: (callback: (info: any) => void) => void
    onUpdaterError: (callback: (error: string) => void) => void
    onUpdaterDownloadProgress: (callback: (progress: any) => void) => void
    onUpdaterUpdateDownloaded: (callback: (info: any) => void) => void
    removeAllUpdaterListeners: () => void
  }
}
