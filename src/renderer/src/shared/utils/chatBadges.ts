import {
  isKickLevelBadge,
  kickBadgeImage,
  kickLevelBadgeImage,
  parseKickLevel
} from '../constants/kickBadgeImages'

export type ChatBadge = {
  id: string
  title?: string
  imageUrl?: string
  label?: string
  wide?: boolean
  sortOrder?: number
  twitch?: {
    setId: string
    version: string
    channelId?: string
  }
}

function svgDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const ROLE_ICONS: Record<string, string> = {
  moderator: svgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" rx="3" fill="#53FC18"/><path fill="#111" d="M8 2.2 9.1 5h3.1l-2.5 1.9.9 3-2.6-1.8L5.4 9.9l.9-3L3.8 5h3.1z"/></svg>`
  ),
  vip: svgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" rx="3" fill="#EAB308"/><path fill="#111" d="M8 3.2 10.2 8 8 12.8 5.8 8z"/></svg>`
  ),
  og: svgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" rx="3" fill="#F97316"/><text x="8" y="11.2" text-anchor="middle" font-size="7" font-family="Arial" font-weight="700" fill="#111">OG</text></svg>`
  ),
  founder: svgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" rx="3" fill="#A855F7"/><path fill="#fff" d="M4 11.2 5.2 5.8 8 8.2l2.8-2.4L12 11.2z"/></svg>`
  ),
  verified: svgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" rx="3" fill="#3B82F6"/><path fill="#fff" d="M4.2 8.1 6.6 10.4 11.8 5.2l-1.1-1.1-4.1 4.1-1.3-1.2z"/></svg>`
  ),
  staff: svgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" rx="3" fill="#22C55E"/><path fill="#111" d="M8 3.2 10.4 8 8 12.8 5.6 8z"/></svg>`
  ),
  broadcaster: svgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" rx="3" fill="#EF4444"/><path fill="#fff" d="M4.4 4.4h7.2v1.5H9.4v5.7H6.6V5.9H4.4z"/></svg>`
  ),
  owner: svgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" rx="3" fill="#FF0000"/><path fill="#fff" d="M6 5.2 11.2 8 6 10.8z"/></svg>`
  ),
  member: svgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" rx="3" fill="#2BA640"/><path fill="#fff" d="M8 3.4 9.2 6.5 12.6 6.8 10 8.9 10.8 12.2 8 10.5 5.2 12.2 6 8.9 3.4 6.8 6.8 6.5z"/></svg>`
  ),
  subscriber: svgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" rx="3" fill="#53FC18"/><path fill="#111" d="M8 3.4 9.2 6.5 12.6 6.8 10 8.9 10.8 12.2 8 10.5 5.2 12.2 6 8.9 3.4 6.8 6.8 6.5z"/></svg>`
  ),
  generic: svgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" rx="3" fill="#64748B"/><circle cx="8" cy="8" r="3.2" fill="#fff"/></svg>`
  )
}

export type KickSubscriberBadge = {
  months: number
  src: string
  title?: string
}

export function roleBadgeIcon(role: string): string | undefined {
  return ROLE_ICONS[role]
}

function firstImageUrl(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && /^https:\/\//.test(value) && !value.includes('@')) return value
    if (Array.isArray(value)) {
      const nested = firstImageUrl(...value)
      if (nested) return nested
    }
  }
  return undefined
}

export function extractKickSubscriberBadges(channelData: unknown): KickSubscriberBadge[] {
  if (!channelData || typeof channelData !== 'object') return []

  const root = channelData as Record<string, any>
  const lists = [
    root.subscriber_badges,
    root.chatroom?.channel?.subscriber_badges,
    root.user?.subscriber_badges,
    root.channel?.subscriber_badges
  ]

  const badges: KickSubscriberBadge[] = []

  for (const list of lists) {
    if (!Array.isArray(list)) continue

    for (const item of list) {
      const months = Number(item?.months ?? item?.count ?? 0)
      const src = firstImageUrl(
        item?.badge_image?.src,
        item?.badge_image?.srcset?.split?.(/\s+/)?.[0],
        item?.image?.src,
        item?.src
      )
      if (!src) continue
      badges.push({
        months: Number.isFinite(months) ? months : 0,
        src,
        title: item?.badge_image?.alt || item?.text || `${months}-Month Subscriber`
      })
    }
  }

  return badges.sort((a, b) => a.months - b.months)
}

function pickKickSubscriberImage(
  subscriberBadges: KickSubscriberBadge[],
  count: number
): KickSubscriberBadge | undefined {
  const eligible = subscriberBadges.filter((badge) => badge.months <= Math.max(count, 0))
  if (eligible.length === 0) return subscriberBadges[0]
  return eligible[eligible.length - 1]
}

function normalizeKickBadgeList(rawBadges: unknown): unknown[] {
  if (Array.isArray(rawBadges)) return rawBadges
  if (typeof rawBadges === 'string') {
    try {
      const parsed = JSON.parse(rawBadges)
      return Array.isArray(parsed) ? parsed : parsed ? [parsed] : []
    } catch {
      return rawBadges ? [rawBadges] : []
    }
  }
  if (rawBadges && typeof rawBadges === 'object') return [rawBadges]
  return []
}

function badgeSortOrder(value: unknown, fallback: number): number {
  const order = Number(value)
  return Number.isFinite(order) ? order : fallback
}

function mapKickBadgesV2(rawBadgesV2: unknown): ChatBadge[] {
  return normalizeKickBadgeList(rawBadgesV2).flatMap((item, index) => {
    if (!item || typeof item !== 'object') return []

    const badge = item as Record<string, any>
    if (badge.selected === false) return []

    const name = String(badge.name ?? badge.type ?? `kick-v2-${index}`).toLowerCase()
    const level = Number(badge.metadata?.level ?? badge.level ?? 0)
    const imageUrl = firstImageUrl(
      badge.image_url,
      badge.imageUrl,
      badge.src,
      badge.image,
      badge.badge_image?.src
    )
    const isLevel = name === 'level' || isKickLevelBadge(name)

    if (!imageUrl && isLevel && Number.isFinite(level) && level > 0) {
      return [
        {
          id: `level-${level}-${index}`,
          title: `Level ${level}`,
          imageUrl: kickLevelBadgeImage(level),
          wide: true,
          sortOrder: badgeSortOrder(badge.sort_order, 1)
        }
      ]
    }

    if (!imageUrl) return []

    return [
      {
        id: `${name}-${index}`,
        title: isLevel && level > 0 ? `Level ${level}` : String(badge.name ?? badge.text ?? name),
        imageUrl,
        wide: isLevel || String(badge.badge_type ?? '') === 'global',
        sortOrder: badgeSortOrder(badge.sort_order, isLevel ? 1 : 4)
      }
    ]
  })
}

export function mapKickIdentityBadges(
  rawBadges: unknown,
  subscriberBadges: KickSubscriberBadge[] = [],
  rawBadgesV2: unknown = []
): ChatBadge[] {
  const classic = normalizeKickBadgeList(rawBadges).flatMap((item, index) => {
    if (typeof item === 'string') {
      const type = item.toLowerCase()
      return [
        {
          id: `${type}-${index}`,
          title: item,
          imageUrl: kickBadgeImage(type),
          sortOrder: 50
        }
      ]
    }

    if (!item || typeof item !== 'object') return []

    const badge = item as Record<string, any>
    if (typeof badge.imageUrl === 'string' && badge.id) {
      return [badge as ChatBadge]
    }

    const type = String(badge.type ?? badge.name ?? `kick-${index}`).toLowerCase()
    const title = String(badge.text ?? badge.type ?? type)
    const count = Number(badge.count ?? badge.months ?? 0)
    const sortOrder = badgeSortOrder(badge.sort_order, 50)

    if (isKickLevelBadge(type) || /level/i.test(title) || /^(lvl|nível|nivel)$/i.test(type)) {
      const level = parseKickLevel(badge) || Number(badge.metadata?.level ?? 0)
      if (level > 0) {
        return [
          {
            id: `level-${level}-${index}`,
            title: `Level ${level}`,
            imageUrl:
              firstImageUrl(badge.image_url, badge.imageUrl, badge.src) || kickLevelBadgeImage(level),
            wide: true,
            sortOrder: badgeSortOrder(badge.sort_order, 1)
          }
        ]
      }
    }

    if (type === 'subscriber') {
      const custom = pickKickSubscriberImage(subscriberBadges, count)
      return [
        {
          id: `subscriber-${index}`,
          title: custom?.title || (count > 0 ? `${title} (${count})` : title),
          imageUrl: custom?.src || kickBadgeImage('subscriber'),
          sortOrder
        }
      ]
    }

    return [
      {
        id: `${type}-${index}`,
        title: count > 0 ? `${title} (${count})` : title,
        imageUrl:
          firstImageUrl(badge.image_url, badge.image, badge.icon, badge.src, badge.badge_image?.src) ||
          kickBadgeImage(type) ||
          kickBadgeImage('subscriber'),
        sortOrder
      }
    ]
  })

  const merged = [...mapKickBadgesV2(rawBadgesV2), ...classic]
  const seen = new Set<string>()

  return merged
    .filter((badge) => {
      const key = badge.id.startsWith('level-') ? 'level' : badge.id.replace(/-\d+$/, '')
      if (seen.has(key)) return false
      seen.add(key)
      return Boolean(badge.imageUrl)
    })
    .sort((a, b) => (a.sortOrder ?? 50) - (b.sortOrder ?? 50))
}

export function mapKickIdentity(
  identity: unknown,
  subscriberBadges: KickSubscriberBadge[] = []
): ChatBadge[] {
  if (!identity || typeof identity !== 'object') {
    return mapKickIdentityBadges([], subscriberBadges)
  }

  const root = identity as Record<string, any>
  return mapKickIdentityBadges(root.badges, subscriberBadges, root.badges_v2)
}

export function extractKickUserLevel(payload: unknown): number {
  if (!payload || typeof payload !== 'object') return 0

  const root = payload as Record<string, any>
  const lists = [
    root.sender?.identity?.badges_v2,
    root.identity?.badges_v2,
    root.badges_v2,
    root.sender?.identity?.badges,
    root.identity?.badges
  ]

  for (const list of lists) {
    for (const item of normalizeKickBadgeList(list)) {
      if (!item || typeof item !== 'object') continue
      const badge = item as Record<string, any>
      if (badge.selected === false) continue

      const type = String(badge.type ?? badge.name ?? '').toLowerCase()
      const title = String(badge.text ?? '')
      const level = Number(badge.metadata?.level ?? 0)
      if ((type === 'level' || isKickLevelBadge(type) || /level/i.test(title)) && level > 0) {
        return level
      }

      const parsed = parseKickLevel(badge)
      if ((isKickLevelBadge(type) || /level/i.test(title)) && parsed > 0) return parsed
    }
  }

  return 0
}

export function mapYouTubeAuthorBadges(rawBadges: unknown): ChatBadge[] {
  if (!Array.isArray(rawBadges)) return []

  return rawBadges.flatMap((item, index) => {
    const renderer = item?.liveChatAuthorBadgeRenderer
    if (!renderer) return []

    const tooltip = String(renderer.tooltip ?? renderer.accessibility?.accessibilityData?.label ?? '')
    const iconType = String(renderer.icon?.iconType ?? '').toUpperCase()
    const thumbnails = renderer.customThumbnail?.thumbnails
    const imageUrl =
      firstImageUrl(
        Array.isArray(thumbnails) ? thumbnails.map((thumb: { url?: string }) => thumb?.url) : undefined
      ) ||
      roleBadgeIcon(
        iconType === 'MODERATOR'
          ? 'moderator'
          : iconType === 'OWNER'
            ? 'owner'
            : iconType === 'VERIFIED'
              ? 'verified'
              : 'member'
      )

    if (!imageUrl) return []

    return [
      {
        id: `youtube-${iconType || tooltip || index}`,
        title: tooltip || iconType || 'YouTube',
        imageUrl
      }
    ]
  })
}

export function mapTikTokUserBadges(data: unknown): ChatBadge[] {
  if (!data || typeof data !== 'object') return []

  const root = data as Record<string, any>
  const lists = [root.user?.badgeList, root.user?.userBadges, root.userBadges, root.badgeList]
  const badges: ChatBadge[] = []

  for (const list of lists) {
    if (!Array.isArray(list)) continue

    for (const [index, item] of list.entries()) {
      const imageUrl = firstImageUrl(
        item?.url,
        item?.imageUrl,
        item?.combine?.icon?.url?.urlList,
        item?.icon?.url?.urlList,
        item?.icon?.url,
        item?.badgeScene?.icon?.url?.urlList
      )
      if (!imageUrl) continue
      badges.push({
        id: `tiktok-${index}-${imageUrl}`,
        title: item?.displayType || item?.combine?.str || 'TikTok',
        imageUrl
      })
    }
  }

  if (root.user?.isModerator || root.isModerator) {
    badges.unshift({
      id: 'tiktok-moderator',
      title: 'Moderator',
      imageUrl: roleBadgeIcon('moderator')
    })
  }

  const seen = new Set<string>()
  return badges.filter((badge) => {
    if (!badge.imageUrl || seen.has(badge.imageUrl)) return false
    seen.add(badge.imageUrl)
    return true
  })
}
