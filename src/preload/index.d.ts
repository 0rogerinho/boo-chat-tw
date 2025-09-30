import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      fetchYouTube: (
        url: string,
        payload?: string
      ) => Promise<{ success: boolean; data?: any; error?: string }>
      checkForUpdates: () => Promise<{ success: boolean; result?: any; error?: string }>
      downloadUpdate: () => Promise<{ success: boolean; error?: string }>
      installUpdate: () => Promise<{ success: boolean; error?: string }>
      getAppVersion: () => Promise<string>
    }
  }
}
