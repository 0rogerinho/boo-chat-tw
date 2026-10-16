import { isElectronRuntime } from '../overlay/runtime'

export const KICK_PUSHER_FALLBACK = {
  app_key: '34bf7a0ff419a2a775b9',
  cluster: 'us2'
}

type KickLookupResult = {
  success: boolean
  data?: unknown
  error?: string
}

export type KickPusherConfig = {
  app_key: string
  cluster: string
}

export type KickChannelIds = {
  channelId?: string
  chatroomId: string
}

export function normalizeKickSlug(value: string): string {
  const trimmed = value.trim().replace(/^@/, '')
  if (!trimmed) return ''

  try {
    const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://kick.com/${trimmed}`
    const url = new URL(candidate)
    const host = url.hostname.replace(/^www\./, '').toLowerCase()
    if (!/^https?:\/\//i.test(trimmed) || host === 'kick.com') {
      const slug = url.pathname.split('/').filter(Boolean)[0] ?? ''
      return slug.replace(/^@/, '').toLowerCase()
    }
  } catch {
    return trimmed.toLowerCase()
  }

  return trimmed.toLowerCase()
}

function asRecord(value: unknown): Record<string, any> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, any>)
    : null
}

export function extractKickIds(channelData: unknown): KickChannelIds | null {
  const root = asRecord(channelData)
  if (!root) return null

  const nested = asRecord(root.data) ?? root
  const chatroom = asRecord(nested.chatroom) ?? asRecord(root.chatroom)
  const chatroomId = chatroom?.id ?? nested.chatroom_id ?? root.chatroom_id
  const channelId = nested.id ?? chatroom?.channel_id ?? root.id

  if (chatroomId == null || chatroomId === '') return null

  return {
    chatroomId: String(chatroomId),
    channelId: channelId == null || channelId === '' ? undefined : String(channelId)
  }
}

export function parseKickEventData(data: unknown): Record<string, any> | null {
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data)
      return parsed && typeof parsed === 'object' ? parsed : null
    } catch {
      return null
    }
  }

  return data && typeof data === 'object' ? (data as Record<string, any>) : null
}

function isValidKickPusherConfig(value: unknown): value is KickPusherConfig {
  if (!value || typeof value !== 'object') return false
  const config = value as KickPusherConfig
  return (
    typeof config.app_key === 'string' &&
    /^[a-zA-Z0-9]{8,64}$/.test(config.app_key) &&
    typeof config.cluster === 'string' &&
    /^[a-zA-Z0-9-]{2,32}$/.test(config.cluster)
  )
}

async function fetchKickChannelDirect(slug: string): Promise<KickLookupResult> {
  for (const version of ['v2', 'v1'] as const) {
    try {
      const response = await fetch(
        `https://kick.com/api/${version}/channels/${encodeURIComponent(slug)}`,
        { headers: { Accept: 'application/json' } }
      )
      if (!response.ok) continue

      const payload = await response.json()
      if (extractKickIds(payload)) return { success: true, data: payload }

      const nested = asRecord(payload)?.data
      if (extractKickIds(nested)) return { success: true, data: nested }
    } catch (error) {
      console.error(`Erro ao buscar canal Kick (${version}) no renderer:`, error)
    }
  }

  return { success: false, error: 'Falha ao buscar canal da Kick' }
}

export async function fetchKickChannel(slug: string): Promise<KickLookupResult> {
  if (isElectronRuntime) {
    const direct = await fetchKickChannelDirect(slug)
    if (direct.success && extractKickIds(direct.data)) return direct
  }

  try {
    const viaIpc = (await window.electron.ipcRenderer.invoke(
      'fetch-kick-channel',
      slug
    )) as KickLookupResult
    if (viaIpc?.success && extractKickIds(viaIpc.data)) return viaIpc
    return viaIpc ?? { success: false, error: 'Canal não encontrado' }
  } catch (error) {
    console.error('Erro ao buscar canal Kick via IPC:', error)
    return { success: false, error: 'Falha ao buscar canal da Kick' }
  }
}

async function fetchKickPusherConfigDirect(channelId: string): Promise<KickPusherConfig | null> {
  try {
    const response = await fetch(
      `https://web.kick.com/api/v1/realtime/channels/${encodeURIComponent(channelId)}/chat/connection`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client: { id: crypto.randomUUID(), type: 'web' },
          capabilities: { accepted_providers: [{ provider: 'pusher' }] }
        })
      }
    )
    if (!response.ok) return null
    const payload = await response.json()
    const connections = asRecord(payload)?.data?.connections ?? asRecord(payload)?.connections
    const pusher = Array.isArray(connections)
      ? connections.find((item) => asRecord(item)?.provider === 'pusher')
      : null
    const credentials = asRecord(asRecord(pusher)?.credentials)
    const config = {
      app_key: String(credentials?.app_key ?? ''),
      cluster: String(credentials?.cluster ?? '')
    }
    return isValidKickPusherConfig(config) ? config : null
  } catch (error) {
    console.error('Erro ao negociar chave Pusher da Kick no renderer:', error)
    return null
  }
}

export async function fetchKickPusherConfig(channelId?: string): Promise<KickPusherConfig> {
  if (!channelId) return KICK_PUSHER_FALLBACK

  if (isElectronRuntime) {
    const direct = await fetchKickPusherConfigDirect(channelId)
    if (direct) return direct
  }

  try {
    const result = (await window.electron.ipcRenderer.invoke(
      'fetch-kick-realtime',
      channelId
    )) as KickLookupResult
    if (isValidKickPusherConfig(result?.data)) return result.data
  } catch (error) {
    console.error('Erro ao negociar chave Pusher da Kick:', error)
  }

  return KICK_PUSHER_FALLBACK
}
