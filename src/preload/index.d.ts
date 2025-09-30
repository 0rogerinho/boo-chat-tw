import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      fetchYouTube: (
        url: string,
        payload?: string
      ) => Promise<{ success: boolean; data?: any; error?: string }>
    }
  }
}
