import { useEffect, useState } from 'react'
import { resolveTwitchBadge, subscribeTwitchBadges } from '../../../shared/api/twitchBadges'
import { roleBadgeIcon, type ChatBadge } from '../../../shared/utils/chatBadges'
import { isSafeDisplayImageUrl } from '../../../shared/utils/chatHtml'

export function AuthorBadges({ badges }: { badges?: ChatBadge[] }) {
  const [, setRevision] = useState(0)

  useEffect(() => {
    return subscribeTwitchBadges(() => {
      setRevision((current) => current + 1)
    })
  }, [])

  if (!badges?.length) return null

  const resolved = badges
    .map((badge) => {
      if (badge.twitch) {
        const twitch = resolveTwitchBadge(
          badge.twitch.setId,
          badge.twitch.version,
          badge.twitch.channelId
        )
        if (twitch) {
          return { ...badge, imageUrl: twitch.imageUrl, title: twitch.title || badge.title }
        }
      }

      if (badge.imageUrl || badge.label) return badge

      const fallback = roleBadgeIcon(badge.twitch?.setId ?? badge.id.split('/')[0] ?? badge.id)
      return fallback ? { ...badge, imageUrl: fallback } : badge
    })
    .filter((badge) => badge.imageUrl || badge.label)

  if (resolved.length === 0) return null

  return (
    <span className="inline-flex items-center gap-0.5 mr-1 align-middle">
      {resolved.map((badge) => (
        <span key={badge.id} className="inline-flex items-center gap-0.5 align-middle">
          {badge.imageUrl && isSafeDisplayImageUrl(badge.imageUrl) ? (
            <img
              src={badge.imageUrl}
              alt={badge.title ?? badge.id}
              title={badge.title}
              className={
                badge.wide
                  ? 'h-[18px] min-h-[18px] w-auto min-w-[22px] object-contain inline-block align-middle'
                  : 'h-[18px] w-[18px] min-h-[18px] min-w-[18px] object-contain inline-block align-middle'
              }
            />
          ) : null}
          {badge.label ? (
            <span
              className="text-white text-[11px] font-bold leading-none text-outline"
              title={badge.title}
            >
              {badge.label}
            </span>
          ) : null}
        </span>
      ))}
    </span>
  )
}
