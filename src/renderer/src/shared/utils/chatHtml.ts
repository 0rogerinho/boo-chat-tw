import {
  escapeAttr,
  isAllowedChatImageUrl,
  isEmoteImageHost,
  linkImageHtml,
  replaceLinkImages,
  unescapeHtmlAttr
} from './linkImages'
import { isTwshotService, replaceTwshotImages, twshotPendingHtml } from './twshotImages'

const SAFE_INLINE_STYLE =
  /^(?:[a-z-]+:[0-9a-z.%()\s-]+(?:;\s*[a-z-]+:[0-9a-z.%()\s-]+)*)?;?$/i

export const TWITCH_EMOTE_ID = /^[A-Za-z0-9_-]{1,80}$/

export type SafeChatImageKind = 'emote' | 'link'

export type SafeChatImageOptions = {
  alt?: string
  title?: string
  style?: string
  className?: string
  fallbackSrc?: string
  fallbackSrcs?: string[]
}

function parseHttpsUrl(value: string): URL | null {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password) return null
    return url
  } catch {
    return null
  }
}

export function isEmoteImageUrl(value: string): boolean {
  const url = parseHttpsUrl(value)
  return Boolean(url && isEmoteImageHost(url.hostname))
}

export function isSafeDisplayImageUrl(value: string): boolean {
  if (value.startsWith('data:image/svg+xml')) return true

  try {
    const url = new URL(value)
    if (url.username || url.password) return false
    if (url.protocol === 'https:') return true
    return (
      url.protocol === 'http:' &&
      (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '::1')
    )
  } catch {
    return false
  }
}

function safeStyle(value: string | undefined): string | undefined {
  if (!value) return undefined
  const compact = value.replace(/\s+/g, ' ').trim()
  return SAFE_INLINE_STYLE.test(compact) ? compact : undefined
}

export function safeChatImageHtml(
  src: string,
  kind: SafeChatImageKind,
  options: SafeChatImageOptions = {}
): string {
  const allowed =
    kind === 'emote' ? isEmoteImageUrl(src) : isAllowedChatImageUrl(src)
  if (!allowed) return ''

  const attrs = [`src="${escapeAttr(src)}"`, `alt="${escapeAttr(options.alt ?? '')}"`]

  if (options.title) attrs.push(`title="${escapeAttr(options.title)}"`)

  if (kind === 'link') {
    attrs.push(`class="${escapeAttr(options.className || 'chat-link-image')}"`)
    attrs.push('loading="lazy"', 'decoding="async"', 'referrerpolicy="no-referrer"')
  } else {
    const style =
      safeStyle(options.style) ?? 'display:inline;width:30px;height:30px;vertical-align:middle'
    attrs.push(`class="${escapeAttr(options.className || 'chat-emote')}"`)
    attrs.push(`style="${escapeAttr(style)}"`)
  }

  if (options.fallbackSrc && (isEmoteImageUrl(options.fallbackSrc) || isAllowedChatImageUrl(options.fallbackSrc))) {
    attrs.push(`data-fallback-src="${escapeAttr(options.fallbackSrc)}"`)
  }

  if (options.fallbackSrcs?.length) {
    const valid = options.fallbackSrcs.filter(
      (url) => isEmoteImageUrl(url) || isAllowedChatImageUrl(url)
    )
    if (valid.length > 0) {
      attrs.push(`data-fallbacks="${valid.map(escapeAttr).join(' ')}"`)
    }
  }

  return `<img ${attrs.join(' ')} />`
}

function extractAttr(attributes: string, name: string): string | null {
  const quoted = attributes.match(new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, 'i'))
  if (quoted) return quoted[1]

  const unquoted = attributes.match(new RegExp(`${name}\\s*=\\s*([^\\s>]+)`, 'i'))
  return unquoted?.[1] ?? null
}

export function sanitizeChatMessageHtml(html: string, allowLinkImages: boolean): string {
  const prepared = allowLinkImages ? replaceLinkImages(replaceTwshotImages(html)) : html

  return prepared.replace(/<\/?([^\s>/]+)([^>]*)\/?>/g, (match, rawTag: string, attributes: string) => {
    if (match.startsWith('</')) return ''

    if (rawTag.toLowerCase() !== 'img') {
      return `&lt;${rawTag}${attributes}&gt;`
    }

    const service = unescapeHtmlAttr(extractAttr(attributes, 'data-twshot-service') ?? '')
    const id = unescapeHtmlAttr(extractAttr(attributes, 'data-twshot-id') ?? '')
    if (allowLinkImages && service && id) {
      return isTwshotService(service) ? twshotPendingHtml(service, id) : ''
    }

    const src = unescapeHtmlAttr(extractAttr(attributes, 'src') ?? '')
    if (!src) return ''

    if (isEmoteImageUrl(src)) {
      return safeChatImageHtml(src, 'emote')
    }

    if (allowLinkImages && isAllowedChatImageUrl(src)) {
      return linkImageHtml(src)
    }

    return ''
  })
}

function nextFallbackUrl(img: HTMLImageElement): string | null {
  const single = img.dataset.fallbackSrc
  if (single && (isEmoteImageUrl(single) || isAllowedChatImageUrl(single))) {
    delete img.dataset.fallbackSrc
    return single
  }

  const queued = (img.dataset.fallbacks || '').split(/\s+/).filter(Boolean)
  while (queued.length > 0) {
    const candidate = queued.shift() ?? ''
    img.dataset.fallbacks = queued.join(' ')
    if (isEmoteImageUrl(candidate) || isAllowedChatImageUrl(candidate)) {
      return candidate
    }
  }

  delete img.dataset.fallbacks
  return null
}

export function hydrateChatImages(root: ParentNode | null): void {
  if (!root) return

  root.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
    if (img.dataset.chatHydrated === '1') return
    img.dataset.chatHydrated = '1'

    img.addEventListener('error', () => {
      const next = nextFallbackUrl(img)
      if (next) {
        img.src = next
        return
      }
      img.remove()
    })
  })
}
