import { roleBadgeIcon, type ChatBadge } from '../utils/chatBadges'

type BadgeVersion = {
  image_url_1x?: string
  image_url_2x?: string
  image_url_4x?: string
  title?: string
  description?: string
}

type BadgeCatalog = Record<string, Record<string, BadgeVersion>>

type FetchTwitchApiResult = {
  success: boolean
  data?: unknown
  error?: string
}

const CDN = 'https://static-cdn.jtvnw.net/badges/v1'
const SCALE = '2'
const IVR_GLOBAL = 'https://api.ivr.fi/v2/twitch/badges/global'
const IVR_CHANNEL = 'https://api.ivr.fi/v2/twitch/badges/channel'

const STATIC_BADGE_URLS: Record<string, string> = {
  broadcaster: `${CDN}/5527c58c-fb7d-422d-b71b-f309dcb85cc1/${SCALE}`,
  moderator: `${CDN}/3267646d-33f0-4b17-b3df-f923a41db1d0/${SCALE}`,
  vip: `${CDN}/b817aba4-fad8-49e2-b88a-7cc744dfa6ec/${SCALE}`,
  partner: `${CDN}/d12a2e27-16f6-41d0-ab77-b780518f00a3/${SCALE}`,
  premium: `${CDN}/a1dd5073-19c3-4911-8cb4-c464a7bc1510/${SCALE}`,
  turbo: `${CDN}/bd444ec6-8f34-4bf9-91f4-af1e3428d80f/${SCALE}`,
  staff: `${CDN}/d97c37bd-a6a5-496c-b59b-880ad213b64c/${SCALE}`,
  admin: `${CDN}/9ef7e756-5d2f-11e7-8ff4-ac5ea5e4d0e5/${SCALE}`,
  global_mod: `${CDN}/9381f9ec-e5aa-452e-87bf-a04cf1d4b1fc/${SCALE}`,
  'artist-badge': `${CDN}/4300a897-03dc-4e83-8c0e-c332fee7057f/${SCALE}`,
  no_audio: `${CDN}/aef2cd08-f29b-45a1-8c12-d44d7fd5e6f0/${SCALE}`,
  no_video: `${CDN}/199a0dba-58f3-494e-a7fc-1fa0a1001fb8/${SCALE}`
}

const STATIC_BADGE_TITLES: Record<string, string> = {
  broadcaster: 'Broadcaster',
  moderator: 'Moderator',
  vip: 'VIP',
  subscriber: 'Subscriber',
  founder: 'Founder',
  partner: 'Verified',
  premium: 'Prime',
  turbo: 'Turbo',
  staff: 'Staff',
  admin: 'Admin',
  global_mod: 'Global Mod',
  'artist-badge': 'Artist',
  no_audio: 'No Audio',
  no_video: 'No Video',
  'sub-gifter': 'Sub Gifter',
  'bits-leader': 'Bits Leader',
  bits: 'Bits',
  'hype-train': 'Hype Train'
}

const globalCatalog: BadgeCatalog = {}
const channelCatalogs = new Map<string, BadgeCatalog>()
const pendingFetches = new Map<string, Promise<void>>()
const listeners = new Set<() => void>()

function notifyTwitchBadges(): void {
  listeners.forEach((listener) => listener())
}

export function subscribeTwitchBadges(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function parseOldCatalog(data: any): BadgeCatalog {
  const catalog: BadgeCatalog = {}
  const sets = data?.badge_sets ?? {}

  for (const [setId, set] of Object.entries(sets)) {
    catalog[setId] = (set as { versions?: Record<string, BadgeVersion> })?.versions ?? {}
  }

  return catalog
}

function parseHelixCatalog(data: any): BadgeCatalog {
  const catalog: BadgeCatalog = {}
  const sets = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []

  for (const set of sets) {
    const setId = String(set?.set_id ?? '')
    if (!setId) continue
    const versions: Record<string, BadgeVersion> = {}
    for (const version of set?.versions ?? []) {
      const id = String(version?.id ?? '')
      if (!id) continue
      versions[id] = {
        image_url_1x: version.image_url_1x,
        image_url_2x: version.image_url_2x,
        image_url_4x: version.image_url_4x,
        title: version.title,
        description: version.description
      }
    }
    catalog[setId] = versions
  }

  return catalog
}

function parseCatalog(data: unknown): BadgeCatalog {
  if (Array.isArray(data)) return parseHelixCatalog(data)
  const asRecord = data as Record<string, unknown> | null
  if (asRecord?.badge_sets) return parseOldCatalog(asRecord)
  const helix = parseHelixCatalog(asRecord)
  if (Object.keys(helix).length > 0) return helix
  return parseOldCatalog(asRecord)
}

async function fetchCatalog(url: string): Promise<BadgeCatalog> {
  const result = (await window.electron.ipcRenderer.invoke(
    'fetch-twitch-api',
    url
  )) as FetchTwitchApiResult

  if (!result?.success || result.data == null) return {}
  return parseCatalog(result.data)
}

function mergeCatalog(target: BadgeCatalog, incoming: BadgeCatalog): void {
  for (const [setId, versions] of Object.entries(incoming)) {
    target[setId] = { ...target[setId], ...versions }
  }
}

function catalogSize(catalog: BadgeCatalog): number {
  return Object.keys(catalog).length
}

export async function ensureGlobalTwitchBadges(): Promise<void> {
  if (catalogSize(globalCatalog) > 0) return
  const pending = pendingFetches.get('global')
  if (pending) return pending

  const request = fetchCatalog(IVR_GLOBAL)
    .then((catalog) => {
      if (catalogSize(catalog) === 0) return
      mergeCatalog(globalCatalog, catalog)
      notifyTwitchBadges()
    })
    .catch(() => undefined)
    .finally(() => {
      pendingFetches.delete('global')
    })

  pendingFetches.set('global', request)
  return request
}

export async function ensureChannelTwitchBadges(channelId: string): Promise<void> {
  if (!channelId) return
  const existing = channelCatalogs.get(channelId)
  if (existing && catalogSize(existing) > 0) return
  const pending = pendingFetches.get(channelId)
  if (pending) return pending

  const request = fetchCatalog(`${IVR_CHANNEL}?id=${encodeURIComponent(channelId)}`)
    .then((catalog) => {
      channelCatalogs.set(channelId, catalog)
      if (catalogSize(catalog) > 0) notifyTwitchBadges()
    })
    .catch(() => undefined)
    .finally(() => {
      pendingFetches.delete(channelId)
    })

  pendingFetches.set(channelId, request)
  return request
}

function pickBadgeVersion(
  versions: Record<string, BadgeVersion> | undefined,
  version: string
): BadgeVersion | undefined {
  if (!versions) return undefined
  if (versions[version]) return versions[version]

  const target = Number(version)
  if (!Number.isFinite(target)) return undefined

  const closest = Object.keys(versions)
    .map((key) => Number(key))
    .filter((key) => Number.isFinite(key) && key <= target)
    .sort((a, b) => b - a)[0]

  return closest === undefined ? undefined : versions[String(closest)]
}

function badgeImage(badge?: BadgeVersion): string | undefined {
  return badge?.image_url_2x || badge?.image_url_1x || badge?.image_url_4x
}

function staticBadgeImage(setId: string): string | undefined {
  return STATIC_BADGE_URLS[setId] || roleBadgeIcon(setId)
}

export function resolveTwitchBadge(
  setId: string,
  version: string,
  channelId?: string
): { imageUrl: string; title: string } | null {
  const channelBadge = pickBadgeVersion(channelId ? channelCatalogs.get(channelId)?.[setId] : undefined, version)
  const globalBadge = pickBadgeVersion(globalCatalog[setId], version)
  const badge = channelBadge ?? globalBadge
  const imageUrl = badgeImage(badge) || staticBadgeImage(setId)

  if (!imageUrl) return null

  return {
    imageUrl,
    title: badge?.title || badge?.description || STATIC_BADGE_TITLES[setId] || setId
  }
}

function parseBadgesRaw(raw?: string | null): Record<string, string> {
  if (!raw) return {}

  return raw.split(',').reduce<Record<string, string>>((acc, part) => {
    const [setId, version] = part.split('/')
    if (setId) acc[setId] = version || '1'
    return acc
  }, {})
}

export function twitchTagsToBadges(
  badges: Record<string, string> | string | null | undefined,
  channelId?: string,
  badgesRaw?: string | null
): ChatBadge[] {
  const fromObject =
    badges && typeof badges === 'object' && !Array.isArray(badges) ? badges : undefined
  const parsed = fromObject && Object.keys(fromObject).length > 0 ? fromObject : parseBadgesRaw(badgesRaw)
  const fromString = typeof badges === 'string' ? parseBadgesRaw(badges) : parsed

  return Object.entries(fromString).map(([setId, version]) => {
    const resolved = resolveTwitchBadge(setId, version, channelId)
    return {
      id: `${setId}/${version}`,
      title: resolved?.title ?? STATIC_BADGE_TITLES[setId] ?? setId,
      imageUrl: resolved?.imageUrl,
      twitch: { setId, version, channelId }
    }
  })
}
