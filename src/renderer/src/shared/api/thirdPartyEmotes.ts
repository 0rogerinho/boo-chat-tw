import { safeChatImageHtml } from '../utils/chatHtml'

export type EmoteProvider = '7tv' | 'bttv'

export type ThirdPartyEmote = {
  id: string
  name: string
  url: string
  fallbackUrl?: string
  provider: EmoteProvider
  animated?: boolean
  source: 'global' | 'channel'
  width?: number
  height?: number
  zeroWidth?: boolean
}

export type EmoteOptions = {
  seventv: boolean
  betterttv: boolean
}

type CatalogSnapshot = {
  fetchedAt: number
  seventv: ThirdPartyEmote[]
  bttv: ThirdPartyEmote[]
  seventvSetId?: string
  seventvUserId?: string
  fetchedProviders?: {
    seventv?: number
    bttv?: number
  }
}

type FetchEmotesResult = {
  success: boolean
  data?: unknown
  error?: string
  status?: number
}

type EventSession = {
  channelId: string
  setId: string
  userId?: string
  source: EventSource | null
  closed: boolean
  retries: number
  timer: ReturnType<typeof setTimeout> | null
}

const CACHE_TTL_MS = 6 * 60 * 60 * 1000
const CACHE_PREFIX = 'boo-chat:emotes:v2:'
const EMOTE_HEIGHT_PX = 30
const EMOTE_MAX_WIDTH_PX = 128
const SEVENTV_ZERO_WIDTH = 256
const SEVENTV_ACTIVE_ZERO_WIDTH = 1
const BACKOFF_STEPS_MS = [60_000, 5 * 60_000, 15 * 60_000]
const EVENT_BACKOFF_MS = [1_000, 2_000, 5_000, 15_000, 30_000]
const TWITCH_NUMERIC_ID = /^[0-9]{1,20}$/

const SEVENTV_GLOBAL = 'https://7tv.io/v3/emote-sets/global'
const BTTV_GLOBAL = 'https://api.betterttv.net/3/cached/emotes/global'

const pendingFetches = new Map<string, Promise<void>>()
const backoffUntil = new Map<string, number>()
const backoffStep = new Map<string, number>()
const channelCatalogs = new Map<string, CatalogSnapshot>()
const resolvedMaps = new Map<string, Map<string, ThirdPartyEmote>>()

let globalCatalog: CatalogSnapshot | null = null
let currentOptions: EmoteOptions = { seventv: true, betterttv: true }
let eventSession: EventSession | null = null

function isTwitchId(value: string): boolean {
  return TWITCH_NUMERIC_ID.test(value)
}

function now(): number {
  return Date.now()
}

function providerFresh(
  snapshot: CatalogSnapshot | null | undefined,
  provider: 'seventv' | 'bttv'
): boolean {
  const at = snapshot?.fetchedProviders?.[provider]
  return typeof at === 'number' && now() - at < CACHE_TTL_MS
}

function markFetched(snapshot: CatalogSnapshot, provider: 'seventv' | 'bttv'): void {
  snapshot.fetchedProviders = {
    ...snapshot.fetchedProviders,
    [provider]: now()
  }
  snapshot.fetchedAt = now()
}

function cacheKey(kind: 'global' | 'channel', channelId?: string): string {
  return kind === 'global' ? `${CACHE_PREFIX}global` : `${CACHE_PREFIX}channel:${channelId}`
}

function readStoredCatalog(key: string): CatalogSnapshot | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CatalogSnapshot
    if (!parsed || typeof parsed.fetchedAt !== 'number') return null
    if (!Array.isArray(parsed.seventv) || !Array.isArray(parsed.bttv)) return null
    return parsed
  } catch {
    return null
  }
}

function writeStoredCatalog(key: string, snapshot: CatalogSnapshot): void {
  try {
    localStorage.setItem(key, JSON.stringify(snapshot))
  } catch {
    // ignore quota / private mode
  }
}

function rememberBackoff(key: string): void {
  const step = backoffStep.get(key) ?? 0
  const delay = BACKOFF_STEPS_MS[Math.min(step, BACKOFF_STEPS_MS.length - 1)]
  backoffStep.set(key, step + 1)
  backoffUntil.set(key, now() + delay)
}

function clearBackoff(key: string): void {
  backoffStep.delete(key)
  backoffUntil.delete(key)
}

function isInBackoff(key: string): boolean {
  return (backoffUntil.get(key) ?? 0) > now()
}

const SEVENTV_FILE_NAME = /^[A-Za-z0-9._-]{1,40}$/

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function normalizeHostUrl(hostUrl: string): string {
  const withProtocol = hostUrl.startsWith('//') ? `https:${hostUrl}` : hostUrl
  try {
    const url = new URL(withProtocol)
    if (url.protocol === 'https:' && (url.hostname === '7tv.app' || url.hostname.endsWith('.7tv.app'))) {
      return url.origin + url.pathname.replace(/\/$/, '')
    }
  } catch {
    // usa o CDN padrão abaixo
  }
  return ''
}

function pickSevenTvFile(host: Record<string, unknown> | null): {
  name: string
  fallbackName: string
  width?: number
  height?: number
} {
  const files = asArray(host?.files)
    .map((entry) => asRecord(entry))
    .filter((entry): entry is Record<string, unknown> => Boolean(entry))

  const preferred = ['2x.webp', '2x', '3x.webp', '1x.webp', '1x']
  const match =
    preferred
      .map((name) => files.find((file) => String(file.name) === name))
      .find((file): file is Record<string, unknown> => Boolean(file)) ??
    files.find((file) => String(file.format).toUpperCase() === 'WEBP') ??
    files[0]

  const rawName = match ? String(match.name) : '2x.webp'
  const name = SEVENTV_FILE_NAME.test(rawName) ? rawName : '2x.webp'
  const fallbackName = name.endsWith('.webp') ? name.replace(/\.webp$/, '') : `${name}.webp`
  const width = Number(match?.width)
  const height = Number(match?.height)

  return {
    name,
    fallbackName,
    width: Number.isFinite(width) && width > 0 ? width : undefined,
    height: Number.isFinite(height) && height > 0 ? height : undefined
  }
}

function seventvUrls(id: string, host: Record<string, unknown> | null): {
  url: string
  fallbackUrl: string
  width?: number
  height?: number
} {
  const file = pickSevenTvFile(host)
  const normalized = typeof host?.url === 'string' ? normalizeHostUrl(host.url) : ''
  const base = normalized || `https://cdn.7tv.app/emote/${id}`

  return {
    url: `${base}/${file.name}`,
    fallbackUrl: `${base}/${file.fallbackName}`,
    width: file.width,
    height: file.height
  }
}

function isSevenTvZeroWidth(item: Record<string, unknown>, data: Record<string, unknown> | null): boolean {
  const itemFlags = Number(item.flags ?? 0)
  const dataFlags = Number(data?.flags ?? 0)
  return (
    (itemFlags & SEVENTV_ACTIVE_ZERO_WIDTH) !== 0 || (dataFlags & SEVENTV_ZERO_WIDTH) !== 0
  )
}

function parseSevenTvEmotes(
  emotes: unknown,
  source: 'global' | 'channel'
): ThirdPartyEmote[] {
  const result: ThirdPartyEmote[] = []

  for (const entry of asArray(emotes)) {
    const item = asRecord(entry)
    if (!item) continue
    const data = asRecord(item.data)
    const id = String(item.id || data?.id || '')
    const name = String(item.name || data?.name || '')
    if (!id || !name || !/^[A-Za-z0-9_-]{1,40}$/.test(id)) continue
    const host = asRecord(data?.host)
    const urls = seventvUrls(id, host)
    result.push({
      id,
      name,
      url: urls.url,
      fallbackUrl: urls.fallbackUrl,
      provider: '7tv',
      animated: Boolean(data?.animated),
      source,
      width: urls.width,
      height: urls.height,
      zeroWidth: isSevenTvZeroWidth(item, data)
    })
  }

  return result
}

function parseBttvEmotes(emotes: unknown, source: 'global' | 'channel'): ThirdPartyEmote[] {
  const result: ThirdPartyEmote[] = []

  for (const entry of asArray(emotes)) {
    const item = asRecord(entry)
    if (!item) continue
    const id = String(item.id || '')
    const name = String(item.code || item.name || '')
    if (!id || !name || !/^[A-Za-z0-9_-]{1,40}$/.test(id)) continue
    const imageType = String(item.imageType || '').toLowerCase()
    const animated = Boolean(item.animated) || imageType === 'gif'
    const base = `https://cdn.betterttv.net/emote/${id}`
    result.push({
      id,
      name,
      url: `${base}/2x`,
      fallbackUrl: `${base}/2x.webp`,
      provider: 'bttv',
      animated,
      source
    })
  }

  return result
}

function emoteDisplayWidth(emote: ThirdPartyEmote): number {
  if (emote.width && emote.height && emote.height > 0) {
    return Math.min(
      EMOTE_MAX_WIDTH_PX,
      Math.max(EMOTE_HEIGHT_PX, Math.round((EMOTE_HEIGHT_PX * emote.width) / emote.height))
    )
  }
  return EMOTE_HEIGHT_PX
}

function emoteImgHtml(emote: ThirdPartyEmote): string {
  const sized = Boolean(emote.width && emote.height)
  const width = emoteDisplayWidth(emote)
  const sizeStyle = sized
    ? `height:${EMOTE_HEIGHT_PX}px;width:${width}px;`
    : `height:${EMOTE_HEIGHT_PX}px;width:auto;`
  const overlay = emote.zeroWidth
    ? `margin-left:-${sized ? width : EMOTE_HEIGHT_PX}px;`
    : ''

  return safeChatImageHtml(emote.url, 'emote', {
    alt: emote.name,
    title: emote.name,
    fallbackSrc: emote.fallbackUrl,
    style: `display:inline;${sizeStyle}max-width:${EMOTE_MAX_WIDTH_PX}px;object-fit:contain;vertical-align:middle;${overlay}`
  })
}

async function fetchEmotesJson(url: string): Promise<FetchEmotesResult> {
  try {
    return (await window.electron.ipcRenderer.invoke('fetch-emotes-api', url)) as FetchEmotesResult
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}

function emptySnapshot(): CatalogSnapshot {
  return { fetchedAt: 0, seventv: [], bttv: [], fetchedProviders: {} }
}

function cloneSnapshot(snapshot: CatalogSnapshot): CatalogSnapshot {
  return {
    ...snapshot,
    seventv: [...snapshot.seventv],
    bttv: [...snapshot.bttv],
    fetchedProviders: { ...snapshot.fetchedProviders }
  }
}

async function loadGlobalCatalog(options: EmoteOptions): Promise<void> {
  const key = 'global'
  const stored = globalCatalog ?? readStoredCatalog(cacheKey('global'))
  if (stored) globalCatalog = stored

  const needSevenTv = options.seventv && !providerFresh(stored, 'seventv')
  const needBttv = options.betterttv && !providerFresh(stored, 'bttv')

  if (!needSevenTv && !needBttv) {
    if (stored) globalCatalog = stored
    return
  }

  if (isInBackoff(key) && stored) {
    globalCatalog = stored
    return
  }

  const pending = pendingFetches.get(key)
  if (pending) return pending

  const request = (async () => {
    const next = stored ? cloneSnapshot(stored) : emptySnapshot()
    const [sevenTvResult, bttvResult] = await Promise.all([
      needSevenTv ? fetchEmotesJson(SEVENTV_GLOBAL) : Promise.resolve(null),
      needBttv ? fetchEmotesJson(BTTV_GLOBAL) : Promise.resolve(null)
    ])

    let failed = false
    let fetchedAny = false

    if (sevenTvResult) {
      if (sevenTvResult.success) {
        const data = asRecord(sevenTvResult.data)
        next.seventv = parseSevenTvEmotes(data?.emotes, 'global')
        markFetched(next, 'seventv')
        fetchedAny = true
      } else if (sevenTvResult.status === 404) {
        next.seventv = []
        markFetched(next, 'seventv')
        fetchedAny = true
      } else if (sevenTvResult.status === 429 || sevenTvResult.status === 503) {
        failed = true
      }
    }

    if (bttvResult) {
      if (bttvResult.success) {
        next.bttv = parseBttvEmotes(bttvResult.data, 'global')
        markFetched(next, 'bttv')
        fetchedAny = true
      } else if (bttvResult.status === 404) {
        next.bttv = []
        markFetched(next, 'bttv')
        fetchedAny = true
      } else if (bttvResult.status === 429 || bttvResult.status === 503) {
        failed = true
      }
    }

    if (failed) rememberBackoff(key)
    else if (fetchedAny) clearBackoff(key)

    if (fetchedAny) {
      globalCatalog = next
      writeStoredCatalog(cacheKey('global'), next)
    } else if (stored) {
      globalCatalog = stored
    }
  })().finally(() => {
    pendingFetches.delete(key)
  })

  pendingFetches.set(key, request)
  return request
}

async function loadChannelCatalog(channelId: string, options: EmoteOptions): Promise<void> {
  if (!isTwitchId(channelId)) return

  const key = `channel:${channelId}`
  const stored = channelCatalogs.get(channelId) ?? readStoredCatalog(cacheKey('channel', channelId))
  if (stored) channelCatalogs.set(channelId, stored)

  const needSevenTv = options.seventv && !providerFresh(stored, 'seventv')
  const needBttv = options.betterttv && !providerFresh(stored, 'bttv')

  if (!needSevenTv && !needBttv) {
    if (stored) channelCatalogs.set(channelId, stored)
    return
  }

  if (isInBackoff(key) && stored) {
    channelCatalogs.set(channelId, stored)
    return
  }

  const pending = pendingFetches.get(key)
  if (pending) return pending

  const request = (async () => {
    const next = stored ? cloneSnapshot(stored) : emptySnapshot()
    const [sevenTvResult, bttvResult] = await Promise.all([
      needSevenTv
        ? fetchEmotesJson(`https://7tv.io/v3/users/twitch/${channelId}`)
        : Promise.resolve(null),
      needBttv
        ? fetchEmotesJson(`https://api.betterttv.net/3/cached/users/twitch/${channelId}`)
        : Promise.resolve(null)
    ])

    let failed = false
    let fetchedAny = false

    if (sevenTvResult) {
      if (sevenTvResult.success) {
        const data = asRecord(sevenTvResult.data)
        const emoteSet = asRecord(data?.emote_set)
        const user = asRecord(data?.user)
        next.seventv = parseSevenTvEmotes(emoteSet?.emotes, 'channel')
        next.seventvSetId = typeof emoteSet?.id === 'string' ? emoteSet.id : undefined
        next.seventvUserId = typeof user?.id === 'string' ? user.id : undefined
        markFetched(next, 'seventv')
        fetchedAny = true
      } else if (sevenTvResult.status === 404) {
        next.seventv = []
        next.seventvSetId = undefined
        next.seventvUserId = undefined
        markFetched(next, 'seventv')
        fetchedAny = true
      } else if (sevenTvResult.status === 429 || sevenTvResult.status === 503) {
        failed = true
      }
    }

    if (bttvResult) {
      if (bttvResult.success) {
        const data = asRecord(bttvResult.data)
        next.bttv = [
          ...parseBttvEmotes(data?.channelEmotes, 'channel'),
          ...parseBttvEmotes(data?.sharedEmotes, 'channel')
        ]
        markFetched(next, 'bttv')
        fetchedAny = true
      } else if (bttvResult.status === 404) {
        next.bttv = []
        markFetched(next, 'bttv')
        fetchedAny = true
      } else if (bttvResult.status === 429 || bttvResult.status === 503) {
        failed = true
      }
    }

    if (failed) rememberBackoff(key)
    else if (fetchedAny) clearBackoff(key)

    if (fetchedAny || stored) {
      channelCatalogs.set(channelId, next)
      writeStoredCatalog(cacheKey('channel', channelId), next)
    }
  })().finally(() => {
    pendingFetches.delete(key)
  })

  pendingFetches.set(key, request)
  return request
}

function addEmotes(map: Map<string, ThirdPartyEmote>, emotes: ThirdPartyEmote[] | undefined): void {
  if (!emotes) return
  for (const emote of emotes) {
    map.set(emote.name, emote)
  }
}

function rebuildResolvedMap(channelId?: string): Map<string, ThirdPartyEmote> {
  const map = new Map<string, ThirdPartyEmote>()
  const channel = channelId ? channelCatalogs.get(channelId) : undefined

  if (currentOptions.betterttv) addEmotes(map, globalCatalog?.bttv)
  if (currentOptions.seventv) addEmotes(map, globalCatalog?.seventv)
  if (currentOptions.betterttv) addEmotes(map, channel?.bttv)
  if (currentOptions.seventv) addEmotes(map, channel?.seventv)

  const key = channelId || 'global'
  resolvedMaps.set(key, map)
  return map
}

function getResolvedMap(channelId?: string): Map<string, ThirdPartyEmote> {
  const key = channelId || 'global'
  return resolvedMaps.get(key) ?? rebuildResolvedMap(channelId)
}

function persistChannelCatalog(channelId: string): void {
  const snapshot = channelCatalogs.get(channelId)
  if (!snapshot) return
  writeStoredCatalog(cacheKey('channel', channelId), snapshot)
}

function upsertChannelEmote(channelId: string, emote: ThirdPartyEmote): void {
  const snapshot = channelCatalogs.get(channelId) ?? emptySnapshot()
  const next = snapshot.seventv.filter((item) => item.id !== emote.id && item.name !== emote.name)
  next.push(emote)
  snapshot.seventv = next
  snapshot.fetchedAt = snapshot.fetchedAt || now()
  channelCatalogs.set(channelId, snapshot)
  persistChannelCatalog(channelId)
  rebuildResolvedMap(channelId)
}

function removeChannelEmote(channelId: string, id?: string, name?: string): void {
  const snapshot = channelCatalogs.get(channelId)
  if (!snapshot) return
  snapshot.seventv = snapshot.seventv.filter((item) => {
    if (id && item.id === id) return false
    if (name && item.name === name) return false
    return true
  })
  channelCatalogs.set(channelId, snapshot)
  persistChannelCatalog(channelId)
  rebuildResolvedMap(channelId)
}

function parseSevenTvChangeEmote(value: unknown): ThirdPartyEmote | null {
  const item = asRecord(value)
  if (!item) return null
  const parsed = parseSevenTvEmotes([item], 'channel')
  return parsed[0] ?? null
}

function handleEmoteSetDispatch(channelId: string, body: Record<string, unknown>): void {
  for (const change of asArray(body.pushed)) {
    const entry = asRecord(change)
    if (entry?.key !== 'emotes') continue
    const emote = parseSevenTvChangeEmote(entry.value)
    if (emote) upsertChannelEmote(channelId, emote)
  }

  for (const change of asArray(body.pulled)) {
    const entry = asRecord(change)
    if (entry?.key !== 'emotes') continue
    const oldValue = asRecord(entry.old_value)
    removeChannelEmote(
      channelId,
      oldValue ? String(oldValue.id || '') : undefined,
      oldValue ? String(oldValue.name || '') : undefined
    )
  }

  for (const change of asArray(body.updated)) {
    const entry = asRecord(change)
    if (entry?.key !== 'emotes') continue
    const oldValue = asRecord(entry.old_value)
    if (oldValue) {
      removeChannelEmote(channelId, String(oldValue.id || ''), String(oldValue.name || ''))
    }
    const emote = parseSevenTvChangeEmote(entry.value)
    if (emote) upsertChannelEmote(channelId, emote)
  }
}

function extractUpdatedSetId(body: Record<string, unknown>): string | undefined {
  for (const change of asArray(body.updated)) {
    const entry = asRecord(change)
    const key = String(entry?.key || '')
    if (key === 'emote_set_id' && typeof entry?.value === 'string') {
      return entry.value
    }
    if (key === 'emote_set') {
      const value = asRecord(entry?.value)
      if (typeof value?.id === 'string') return value.id
    }
  }
  return undefined
}

async function refreshChannelSevenTv(channelId: string): Promise<void> {
  const key = `channel:${channelId}`
  if (isInBackoff(key) || !isTwitchId(channelId)) return

  const result = await fetchEmotesJson(`https://7tv.io/v3/users/twitch/${channelId}`)
  if (!result.success) {
    if (result.status === 429 || result.status === 503) rememberBackoff(key)
    return
  }

  clearBackoff(key)
  const current = channelCatalogs.get(channelId) ?? emptySnapshot()
  const data = asRecord(result.data)
  const emoteSet = asRecord(data?.emote_set)
  const user = asRecord(data?.user)
  current.seventv = parseSevenTvEmotes(emoteSet?.emotes, 'channel')
  current.seventvSetId = typeof emoteSet?.id === 'string' ? emoteSet.id : undefined
  current.seventvUserId = typeof user?.id === 'string' ? user.id : current.seventvUserId
  markFetched(current, 'seventv')
  channelCatalogs.set(channelId, current)
  persistChannelCatalog(channelId)
  rebuildResolvedMap(channelId)

  if (current.seventvSetId && currentOptions.seventv) {
    startSevenTvEvents(channelId, current.seventvSetId, current.seventvUserId)
  }
}

function handleEventPayload(channelId: string, payload: unknown): void {
  const root = asRecord(payload)
  if (!root) return

  const data = asRecord(root.d) ?? root
  const type = String(data.type || root.type || '')
  const body = asRecord(data.body) ?? data

  if (type.endsWith('emote_set.update') || type === 'emote_set.update') {
    handleEmoteSetDispatch(channelId, body)
    return
  }

  if (type.endsWith('user.update') || type === 'user.update') {
    const nextSetId = extractUpdatedSetId(body)
    const current = channelCatalogs.get(channelId)
    if (nextSetId && nextSetId !== current?.seventvSetId) {
      void refreshChannelSevenTv(channelId)
    }
  }
}

export function stopSevenTvEvents(): void {
  if (!eventSession) return
  eventSession.closed = true
  eventSession.source?.close()
  if (eventSession.timer) clearTimeout(eventSession.timer)
  eventSession = null
}

function connectSevenTvEvents(session: EventSession): void {
  if (session.closed) return

  const subscriptions = [`emote_set.update<object_id=${session.setId}>`]
  if (session.userId) {
    subscriptions.push(`user.update<object_id=${session.userId}>`)
  }

  const url = `https://events.7tv.io/v3@${encodeURIComponent(subscriptions.join(','))}`
  const source = new EventSource(url)
  session.source = source

  const onPayload = (event: Event) => {
    if (session.closed) return
    const message = event as MessageEvent<string>
    if (!message.data) return
    try {
      handleEventPayload(session.channelId, JSON.parse(message.data))
    } catch {
      // ignore malformed frames
    }
  }

  source.onmessage = onPayload
  source.addEventListener('dispatch', onPayload)
  source.addEventListener('hello', () => {
    session.retries = 0
  })

  source.onerror = () => {
    source.close()
    session.source = null
    if (session.closed) return
    const delay = EVENT_BACKOFF_MS[Math.min(session.retries, EVENT_BACKOFF_MS.length - 1)]
    session.retries += 1
    session.timer = setTimeout(() => {
      if (!session.closed) connectSevenTvEvents(session)
    }, delay)
  }
}

function startSevenTvEvents(channelId: string, setId: string, userId?: string): void {
  if (
    eventSession &&
    !eventSession.closed &&
    eventSession.channelId === channelId &&
    eventSession.setId === setId &&
    eventSession.userId === userId
  ) {
    return
  }

  stopSevenTvEvents()
  const session: EventSession = {
    channelId,
    setId,
    userId,
    source: null,
    closed: false,
    retries: 0,
    timer: null
  }
  eventSession = session
  connectSevenTvEvents(session)
}

function syncSevenTvEvents(channelId: string): void {
  if (!currentOptions.seventv) {
    stopSevenTvEvents()
    return
  }

  const snapshot = channelCatalogs.get(channelId)
  if (!snapshot?.seventvSetId) {
    if (eventSession?.channelId === channelId) stopSevenTvEvents()
    return
  }

  startSevenTvEvents(channelId, snapshot.seventvSetId, snapshot.seventvUserId)
}

export async function ensureThirdPartyEmotes(
  channelId: string,
  options: EmoteOptions
): Promise<void> {
  currentOptions = {
    seventv: options.seventv !== false,
    betterttv: options.betterttv !== false
  }

  if (!currentOptions.seventv && !currentOptions.betterttv) {
    stopSevenTvEvents()
    resolvedMaps.clear()
    return
  }

  await Promise.all([loadGlobalCatalog(currentOptions), loadChannelCatalog(channelId, currentOptions)])
  rebuildResolvedMap()
  rebuildResolvedMap(channelId)
  syncSevenTvEvents(channelId)
}

export function replaceThirdPartyEmotes(text: string, channelId?: string): string {
  if (!text || (!currentOptions.seventv && !currentOptions.betterttv)) return text

  const map = getResolvedMap(channelId)
  if (map.size === 0) return text

  return text.replace(/(<[^>]+>)|([^<]+)/g, (match, tag: string | undefined, plain: string | undefined) => {
    if (tag) return tag
    if (!plain) return match

    return plain.replace(/(\S+)/g, (token) => {
      const emote = map.get(token)
      if (!emote) return token
      return emoteImgHtml(emote)
    })
  })
}
