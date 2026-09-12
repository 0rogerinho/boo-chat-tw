import { isElectronRuntime } from './runtime'

type TikTokStatusPayload = {
  status: 'connected' | 'disconnected' | 'error'
  message?: string
  roomId?: string
}

type TikTokChatPayload = {
  username: string
  message: string
  channel: string
  timestamp: number
  badges?: Array<{ id: string; title?: string; imageUrl?: string }>
}

type IpcListener = (...args: any[]) => void

const configListeners = new Set<IpcListener>()
const tiktokStatusListeners = new Set<(payload: TikTokStatusPayload) => void>()
const tiktokChatListeners = new Set<(payload: TikTokChatPayload) => void>()

let eventSource: EventSource | null = null

function parseSseData<T>(event: Event): T | null {
  const message = event as MessageEvent<string>
  if (!message.data) return null

  try {
    return JSON.parse(message.data) as T
  } catch {
    return null
  }
}

function connectOverlayEvents(): void {
  if (eventSource) {
    eventSource.close()
  }

  eventSource = new EventSource('/api/events')

  eventSource.addEventListener('config-updated', (event) => {
    const data = parseSseData<unknown>(event)
    if (data === null) return
    configListeners.forEach((listener) => listener({}, data))
  })

  eventSource.addEventListener('tiktok-status', (event) => {
    const data = parseSseData<TikTokStatusPayload>(event)
    if (!data) return
    tiktokStatusListeners.forEach((listener) => listener(data))
  })

  eventSource.addEventListener('tiktok-chat', (event) => {
    const data = parseSseData<TikTokChatPayload>(event)
    if (!data) return
    tiktokChatListeners.forEach((listener) => listener(data))
  })

  eventSource.onerror = () => {
    eventSource?.close()
    eventSource = null
    window.setTimeout(connectOverlayEvents, 2000)
  }
}

async function invokeChannel(channel: string, ...args: any[]): Promise<any> {
  if (channel === 'get-config') {
    const response = await fetch('/api/config')
    return response.json()
  }

  if (channel === 'get-system') {
    return 'overlay'
  }

  if (channel === 'fetch-twitch-api') {
    const targetUrl = encodeURIComponent(String(args[0] ?? ''))
    const response = await fetch(`/api/twitch?url=${targetUrl}`)
    return response.json()
  }

  if (channel === 'fetch-emotes-api') {
    const targetUrl = encodeURIComponent(String(args[0] ?? ''))
    const response = await fetch(`/api/emotes?url=${targetUrl}`)
    return response.json()
  }

  if (channel === 'fetch-kick-channel') {
    const slug = encodeURIComponent(String(args[0] ?? ''))
    const response = await fetch(`/api/kick/channels/${slug}`)
    return response.json()
  }

  if (channel === 'twshot-resolve') {
    const service = encodeURIComponent(String(args[0] ?? ''))
    const id = encodeURIComponent(String(args[1] ?? ''))
    const response = await fetch(`/api/twshot/resolve?service=${service}&id=${id}`)
    return response.json()
  }

  if (channel === 'get-overlay-url') {
    return {
      success: true,
      url: `${window.location.origin}/#/overlay`,
      appUrl: `${window.location.origin}/`
    }
  }

  return null
}

export function installBrowserBridge(): void {
  if (isElectronRuntime) return

  connectOverlayEvents()

  window.electron = {
    ipcRenderer: {
      invoke: invokeChannel,
      send: () => undefined,
      on: (channel, callback) => {
        if (channel === 'config-updated') {
          configListeners.add(callback)
        }
      },
      removeListener: (channel, callback) => {
        if (channel === 'config-updated') {
          configListeners.delete(callback)
        }
      },
      removeAllListeners: (channel) => {
        if (channel === 'config-updated') {
          configListeners.clear()
        }
      }
    }
  }

  window.api = {
    fetchYouTube: async (url: string, payload?: string) => {
      const response = await fetch('/api/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, payload })
      })
      return response.json()
    },
    fetchTwitchApi: async (url: string) => {
      const response = await fetch(`/api/twitch?url=${encodeURIComponent(url)}`)
      return response.json()
    },
    connectTikTok: async (channel: string) => {
      const response = await fetch('/api/tiktok/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel })
      })
      return response.json()
    },
    disconnectTikTok: async () => {
      const response = await fetch('/api/tiktok/disconnect', { method: 'POST' })
      return response.json()
    },
    onTikTokStatus: (callback) => {
      tiktokStatusListeners.add(callback)
      return () => {
        tiktokStatusListeners.delete(callback)
      }
    },
    onTikTokChat: (callback) => {
      tiktokChatListeners.add(callback)
      return () => {
        tiktokChatListeners.delete(callback)
      }
    },
    checkForUpdates: async () => ({ success: false }),
    downloadUpdate: async () => ({ success: false }),
    installUpdate: async () => undefined,
    getAppVersion: async () => 'overlay',
    onUpdaterCheckingForUpdate: () => undefined,
    onUpdaterUpdateAvailable: () => undefined,
    onUpdaterUpdateNotAvailable: () => undefined,
    onUpdaterError: () => undefined,
    onUpdaterDownloadProgress: () => undefined,
    onUpdaterUpdateDownloaded: () => undefined,
    removeAllUpdaterListeners: () => undefined
  }
}
