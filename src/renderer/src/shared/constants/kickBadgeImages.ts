import kickBroadcaster from '../assets/kick-badges/broadcaster.svg?raw'
import kickFounder from '../assets/kick-badges/founder.svg?raw'
import kickModerator from '../assets/kick-badges/moderator.svg?raw'
import kickOg from '../assets/kick-badges/og.svg?raw'
import kickSidekick from '../assets/kick-badges/sidekick.svg?raw'
import kickSubGifter from '../assets/kick-badges/sub_gifter.svg?raw'
import kickSubscriber from '../assets/kick-badges/subscriber.svg?raw'
import kickVerified from '../assets/kick-badges/verified.svg?raw'
import kickVip from '../assets/kick-badges/vip.svg?raw'

function svgDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const KICK_BADGE_IMAGES: Record<string, string> = {
  broadcaster: svgDataUri(kickBroadcaster),
  founder: svgDataUri(kickFounder),
  moderator: svgDataUri(kickModerator),
  og: svgDataUri(kickOg),
  sidekick: svgDataUri(kickSidekick),
  staff: svgDataUri(kickBroadcaster),
  subscriber: svgDataUri(kickSubscriber),
  sub_gifter: svgDataUri(kickSubGifter),
  'sub-gifter': svgDataUri(kickSubGifter),
  subgifter: svgDataUri(kickSubGifter),
  verified: svgDataUri(kickVerified),
  vip: svgDataUri(kickVip),
  mod: svgDataUri(kickModerator),
  host: svgDataUri(kickBroadcaster),
  sub: svgDataUri(kickSubscriber)
}

export function kickBadgeImage(type: string): string | undefined {
  return KICK_BADGE_IMAGES[type]
}

export function isKickLevelBadge(type: string): boolean {
  return /^(level|user_level|watch_level|userlevel|kick_level|lvl)$/.test(type)
}

function levelBadgeColors(level: number): { fill: string; text: string; stroke: string } {
  if (level >= 100) return { fill: '#1A1400', text: '#F5C518', stroke: '#F5C518' }
  if (level >= 75) return { fill: '#1A0B00', text: '#FF8A00', stroke: '#FF8A00' }
  if (level >= 50) return { fill: '#14001A', text: '#C084FC', stroke: '#C084FC' }
  if (level >= 25) return { fill: '#00141A', text: '#38BDF8', stroke: '#38BDF8' }
  if (level >= 10) return { fill: '#05210A', text: '#53FC18', stroke: '#53FC18' }
  return { fill: '#111827', text: '#D1D5DB', stroke: '#6B7280' }
}

export function kickLevelBadgeImage(level: number): string {
  const safeLevel = Math.max(1, Math.round(level))
  const digits = String(safeLevel).length
  const width = digits === 1 ? 18 : digits === 2 ? 24 : 30
  const { fill, text, stroke } = levelBadgeColors(safeLevel)
  const fontSize = digits >= 3 ? 10 : 11

  return svgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 18" width="${width}" height="18">` +
      `<rect x="0.5" y="0.5" width="${width - 1}" height="17" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="1"/>` +
      `<text x="${width / 2}" y="13" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="700" fill="${text}">${safeLevel}</text>` +
      `</svg>`
  )
}

export function parseKickLevel(badge: { count?: unknown; text?: unknown; type?: unknown }): number {
  const count = Number(badge.count)
  if (Number.isFinite(count) && count > 0) return count

  const text = String(badge.text ?? badge.type ?? '')
  const match = text.match(/(\d+)/)
  if (!match) return 0
  const parsed = Number(match[1])
  return Number.isFinite(parsed) ? parsed : 0
}
