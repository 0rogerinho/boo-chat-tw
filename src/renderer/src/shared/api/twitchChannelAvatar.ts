const API_BASE = 'http://localhost:8080/v1/twitch/channels'

export type TwitchChannelAvatar = {
  channelId: string
  login: string
  displayName: string
  avatarUrl: string
}

type FetchTwitchApiResult = {
  success: boolean
  data?: TwitchChannelAvatar
  error?: string
  status?: number
}

const avatarCache = new Map<string, TwitchChannelAvatar>()
const pendingFetches = new Map<string, Promise<TwitchChannelAvatar | null>>()

export function getCachedChannelAvatar(channelId: string): TwitchChannelAvatar | undefined {
  return avatarCache.get(channelId)
}

export async function fetchChannelAvatar(
  channelId: string
): Promise<TwitchChannelAvatar | null> {
  const cached = avatarCache.get(channelId)
  if (cached) return cached

  const pending = pendingFetches.get(channelId)
  if (pending) return pending

  const fetchPromise = (async () => {
    try {
      const result = (await window.electron.ipcRenderer.invoke(
        'fetch-twitch-api',
        `${API_BASE}/${channelId}/avatar?format=json`
      )) as FetchTwitchApiResult

      console.log('[Twitch Avatar]', { channelId, result })

      if (!result.success || !result.data) return null

      const data: TwitchChannelAvatar = result.data
      avatarCache.set(channelId, data)
      return data
    } catch (error) {
      console.error('Erro ao buscar avatar do canal:', error)
      return null
    } finally {
      pendingFetches.delete(channelId)
    }
  })()

  pendingFetches.set(channelId, fetchPromise)
  return fetchPromise
}
