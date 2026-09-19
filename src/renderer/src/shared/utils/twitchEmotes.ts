import { safeChatImageHtml, TWITCH_EMOTE_ID } from './chatHtml'

export type TwitchEmoteRange = {
  id: string
  posInit: number
  posEnd: number
}

const TWITCH_EMOTE_CDN = 'https://static-cdn.jtvnw.net/emoticons/v2'

function pushEmoteRange(target: TwitchEmoteRange[], id: string, range: string) {
  if (!TWITCH_EMOTE_ID.test(id)) return

  const [startRaw, endRaw] = range.split('-')
  const posInit = Number(startRaw)
  const posEnd = Number(endRaw)
  if (!Number.isFinite(posInit) || !Number.isFinite(posEnd) || posEnd < posInit) return

  target.push({ id, posInit, posEnd })
}

export function getEmojisFromRaw(emotesRaw: string): TwitchEmoteRange[] {
  const result: TwitchEmoteRange[] = []

  for (const part of emotesRaw.split('/')) {
    if (!part) continue
    const colon = part.indexOf(':')
    if (colon <= 0) continue

    const id = part.slice(0, colon)
    for (const range of part.slice(colon + 1).split(',')) {
      if (range) pushEmoteRange(result, id, range)
    }
  }

  return result
}

export function getEmojisFromTags(tags: {
  emotes?: { [emoteid: string]: string[] } | null
  'emotes-raw'?: string
}): TwitchEmoteRange[] {
  const result: TwitchEmoteRange[] = []

  if (tags.emotes) {
    for (const [id, ranges] of Object.entries(tags.emotes)) {
      if (!Array.isArray(ranges)) continue
      for (const range of ranges) {
        pushEmoteRange(result, id, String(range))
      }
    }
  }

  if (result.length > 0) return result
  return tags['emotes-raw'] ? getEmojisFromRaw(tags['emotes-raw']) : []
}

function twitchEmoteHtml(id: string, name: string) {
  const base = `${TWITCH_EMOTE_CDN}/${id}`
  return safeChatImageHtml(`${base}/default/dark/3.0`, 'emote', {
    alt: name,
    title: name,
    fallbackSrc: `${base}/static/dark/3.0`,
    fallbackSrcs: [`${base}/animated/dark/3.0`, `${base}/default/dark/1.0`],
    style: 'display:inline;width:30px;height:30px;vertical-align:middle'
  })
}

export function formatTwitchEmoteMessage(message: string, emojis: TwitchEmoteRange[]) {
  const usable = emojis
    .filter(
      (emoji) =>
        emoji.posInit >= 0 && emoji.posEnd >= emoji.posInit && emoji.posEnd < message.length
    )
    .sort((a, b) => a.posInit - b.posInit)

  if (usable.length === 0) return message

  let result = ''
  let cursor = 0

  for (const emoji of usable) {
    if (emoji.posInit < cursor) continue
    result += message.slice(cursor, emoji.posInit)
    result += twitchEmoteHtml(emoji.id, message.slice(emoji.posInit, emoji.posEnd + 1))
    cursor = emoji.posEnd + 1
  }

  return result + message.slice(cursor)
}
