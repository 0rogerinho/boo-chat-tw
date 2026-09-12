import {
  escapeAttr,
  isAllowedChatImageUrl,
  isInsideHtmlTag,
  linkImageHtml,
  stripTrailingPunctuation
} from './linkImages'

export type TwshotService = 'tenor' | 'imgur' | 'litterbox' | 'lightshot'

const TWSHOT_TAG = /(^|[^A-Za-z0-9_])(upl|tnr|img|ls):([A-Za-z0-9._-]{1,80})/gi
const TWSHOT_ID = /^[A-Za-z0-9._-]{1,80}$/
const SHARE_URL =
  /https:\/\/(?:www\.)?(?:prnt\.sc|prntscr\.com|i\.imgur\.com|imgur\.com|c\.tenor\.com|media\d*\.tenor\.com|tenor\.com)\/[^\s<>"'`]+/gi
const IMGUR_EXTENSIONS = ['gif', 'jpg', 'png', 'webp'] as const

const SERVICE_BY_PREFIX: Record<string, TwshotService> = {
  tnr: 'tenor',
  img: 'imgur',
  upl: 'litterbox',
  ls: 'lightshot'
}

function stripKnownExtension(id: string, pattern: RegExp): string {
  return id.replace(pattern, '')
}

export function isTwshotService(value: string): value is TwshotService {
  return value === 'tenor' || value === 'imgur' || value === 'litterbox' || value === 'lightshot'
}

export function isTwshotImageId(value: string): boolean {
  return TWSHOT_ID.test(value) && !value.includes('..')
}

export function twshotImageUrl(service: TwshotService, rawId: string): string | null {
  if (!isTwshotImageId(rawId)) return null

  if (service === 'tenor') {
    const id = stripKnownExtension(rawId, /\.(?:gif|mp4|webm)$/i)
    return `https://c.tenor.com/${id}/tenor.gif`
  }

  if (service === 'imgur') {
    const id = stripKnownExtension(rawId, /\.(?:jpe?g|png|gif|webp)$/i)
    return `https://i.imgur.com/${id}.gif`
  }

  if (service === 'litterbox') {
    return `https://litter.catbox.moe/${rawId}`
  }

  if (rawId.includes('.')) {
    return `https://img001.prntscr.com/file/img001/${rawId}`
  }

  return null
}

function imgurFallbackUrls(rawId: string): string[] {
  const id = stripKnownExtension(rawId, /\.(?:jpe?g|png|gif|webp)$/i)
  return IMGUR_EXTENSIONS.map((ext) => `https://i.imgur.com/${id}.${ext}`)
}

export function parseTwshotShareUrl(value: string): { service: TwshotService; id: string } | null {
  try {
    const url = new URL(stripTrailingPunctuation(value))
    if (url.protocol !== 'https:' || url.username || url.password) return null

    const host = url.hostname.replace(/^www\./, '').toLowerCase()
    const parts = url.pathname.split('/').filter(Boolean)

    if (host === 'prnt.sc' || host === 'prntscr.com') {
      const id = parts[0] ?? ''
      return isTwshotImageId(id) ? { service: 'lightshot', id } : null
    }

    if (host === 'i.imgur.com') {
      const id = parts[0] ?? ''
      return isTwshotImageId(id) ? { service: 'imgur', id } : null
    }

    if (host === 'imgur.com') {
      if (parts[0] === 'a' || parts[0] === 'gallery') return null
      const id = parts[0] ?? ''
      return isTwshotImageId(id) ? { service: 'imgur', id } : null
    }

    if (host === 'c.tenor.com') {
      const id = parts[0] ?? ''
      return isTwshotImageId(id) ? { service: 'tenor', id } : null
    }

    if (/^media\d*\.tenor\.com$/.test(host)) {
      const id = parts[0] === 'm' ? (parts[1] ?? '') : (parts[0] ?? '')
      return isTwshotImageId(id) ? { service: 'tenor', id } : null
    }

    if (host === 'tenor.com') {
      const view = parts[0] === 'view' ? (parts[1] ?? '') : ''
      const id = view.match(/-(\d+)$/)?.[1] ?? ''
      return isTwshotImageId(id) ? { service: 'tenor', id } : null
    }
  } catch {
    return null
  }

  return null
}

function twshotHtmlFor(service: TwshotService, id: string): string {
  if (service === 'imgur') return linkImageHtmlWithFallbacks(imgurFallbackUrls(id))
  const src = twshotImageUrl(service, id)
  return src ? linkImageHtml(src) : twshotPendingHtml(service, id)
}

function linkImageHtmlWithFallbacks(urls: string[]): string {
  const valid = urls.filter((url) => isAllowedChatImageUrl(url))
  if (valid.length === 0) return ''
  if (valid.length === 1) return linkImageHtml(valid[0])

  const [first, ...rest] = valid
  const fallbacks = rest.map(escapeAttr).join(' ')
  return `<img class="chat-link-image" src="${escapeAttr(first)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" data-fallbacks="${fallbacks}" />`
}

export function twshotPendingHtml(service: TwshotService, id: string): string {
  if (!isTwshotImageId(id) || !isTwshotService(service)) return ''
  return `<img class="chat-link-image chat-twshot-pending" alt="" data-twshot-service="${escapeAttr(service)}" data-twshot-id="${escapeAttr(id)}" />`
}

export function replaceTwshotImages(text: string): string {
  const withUrls = text.replace(SHARE_URL, (rawUrl, offset: number) => {
    if (isInsideHtmlTag(text, offset)) return rawUrl

    const url = stripTrailingPunctuation(rawUrl)
    const trailing = rawUrl.slice(url.length)
    const parsed = parseTwshotShareUrl(url)
    if (!parsed) return rawUrl

    const image = twshotHtmlFor(parsed.service, parsed.id)
    return image ? `${image}${trailing}` : rawUrl
  })

  return withUrls.replace(TWSHOT_TAG, (raw, lead: string, prefix: string, id: string, offset: number) => {
    if (isInsideHtmlTag(withUrls, offset + lead.length)) return raw

    const service = SERVICE_BY_PREFIX[prefix.toLowerCase()]
    if (!service || !isTwshotImageId(id)) return raw

    const image = twshotHtmlFor(service, id)
    return image ? `${lead}${image}` : raw
  })
}

const hydrating = new WeakSet<Element>()

function applyResolvedImage(img: HTMLImageElement, url: string): void {
  img.classList.remove('chat-twshot-pending')
  img.referrerPolicy = 'no-referrer'
  img.loading = 'lazy'
  img.decoding = 'async'
  img.src = url
  img.dataset.twshotDone = '1'
  delete img.dataset.twshotService
  delete img.dataset.twshotId
  img.onerror = () => img.remove()
}

async function resolveTwshotClient(service: TwshotService, id: string): Promise<string | null> {
  try {
    const result = (await window.electron.ipcRenderer.invoke('twshot-resolve', service, id)) as {
      success?: boolean
      url?: string
    } | null
    const url = typeof result?.url === 'string' ? result.url : ''
    if (result?.success && isAllowedChatImageUrl(url)) return url
  } catch {
    // tenta a API publica da TWShot
  }

  try {
    const response = await fetch(
      `https://twshot.0r1.org/api/resolve?service=${encodeURIComponent(service)}&id=${encodeURIComponent(id)}`
    )
    const payload = (await response.json()) as { url?: unknown }
    const url = typeof payload?.url === 'string' ? payload.url : ''
    if (isAllowedChatImageUrl(url)) return url
  } catch {
    return null
  }

  return null
}

export function hydrateTwshotImages(root: ParentNode | null = typeof document === 'undefined' ? null : document): void {
  if (!root) return

  root.querySelectorAll<HTMLImageElement>('img[data-twshot-service][data-twshot-id]').forEach((img) => {
    if (hydrating.has(img) || img.dataset.twshotDone === '1') return

    const service = img.dataset.twshotService ?? ''
    const id = img.dataset.twshotId ?? ''
    if (!isTwshotService(service) || !isTwshotImageId(id)) {
      img.remove()
      return
    }

    hydrating.add(img)
    void resolveTwshotClient(service, id)
      .then((url) => {
        if (url) {
          applyResolvedImage(img, url)
          return
        }
        img.remove()
      })
      .catch(() => {
        img.remove()
      })
  })
}
