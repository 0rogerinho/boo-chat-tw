import { electronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: typeof electronAPI
    api: {
      fetchYouTube: (url: string, payload?: string) => Promise<any>
      checkForUpdates: () => Promise<any>
      downloadUpdate: () => Promise<any>
      installUpdate: () => Promise<any>
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
}

export {}
