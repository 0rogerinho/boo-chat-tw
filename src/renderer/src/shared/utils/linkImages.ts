const IMAGE_EXTENSION = /\.(?:gif|png|jpe?g|webp|avif)$/i
const HTTP_URL = /https:\/\/[^\s<>"'`]+/gi
const TRAILING_PUNCTUATION = /[.,!?;:)+\]}'"]+$/

const EMOTE_HOSTS = new Set([
  'static-cdn.jtvnw.net',
  'files.kick.com',
  'yt3.ggpht.com',
  'cdn.betterttv.net',
  '7tv.app'
])

const TWSHOT_MEDIA_HOSTS = new Set([
  'c.tenor.com',
  'i.imgur.com',
  'litter.catbox.moe',
  'files.catbox.moe',
  'image.prntscr.com',
  'image.prnt.sc',
  'img.lightshot.app'
])

export function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function unescapeHtmlAttr(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

export function stripTrailingPunctuation(value: string): string {
  return value.replace(TRAILING_PUNCTUATION, '')
}

export function isInsideHtmlTag(text: string, offset: number): boolean {
  const before = text.slice(0, offset)
  return before.lastIndexOf('<') > before.lastIndexOf('>')
}

export function isEmoteImageHost(hostname: string): boolean {
  return EMOTE_HOSTS.has(hostname) || hostname.endsWith('.7tv.app')
}

export function isTwshotMediaHost(hostname: string): boolean {
  if (TWSHOT_MEDIA_HOSTS.has(hostname)) return true
  if (/^media\d*\.tenor\.com$/.test(hostname)) return true
  if (/^img\d+\.prntscr\.com$/.test(hostname)) return true
  return false
}

export function isDirectImageUrl(value: string): boolean {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:') return false
    if (url.username || url.password) return false
    return IMAGE_EXTENSION.test(url.pathname)
  } catch {
    return false
  }
}

export function isAllowedChatImageUrl(value: string): boolean {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:') return false
    if (url.username || url.password) return false
    return IMAGE_EXTENSION.test(url.pathname) || isTwshotMediaHost(url.hostname)
  } catch {
    return false
  }
}

export function linkImageHtml(src: string): string {
  if (!isAllowedChatImageUrl(src)) return ''
  return `<img class="chat-link-image" src="${escapeAttr(src)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" />`
}

export function replaceLinkImages(text: string): string {
  return text.replace(HTTP_URL, (rawUrl, offset: number) => {
    if (isInsideHtmlTag(text, offset)) return rawUrl

    const url = stripTrailingPunctuation(rawUrl)
    const trailing = rawUrl.slice(url.length)
    if (!isDirectImageUrl(url)) return rawUrl

    return `${linkImageHtml(url)}${trailing}`
  })
}
