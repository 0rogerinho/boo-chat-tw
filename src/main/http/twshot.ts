const TWSHOT_ID = /^[A-Za-z0-9._-]{1,80}$/
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

type TwshotService = 'tenor' | 'imgur' | 'litterbox' | 'lightshot'

const cache = new Map<string, string | null>()
const inflight = new Map<string, Promise<string | null>>()
let queue = Promise.resolve()

function isTwshotService(value: string): value is TwshotService {
  return value === 'tenor' || value === 'imgur' || value === 'litterbox' || value === 'lightshot'
}

function isAllowedResolvedHost(hostname: string): boolean {
  if (hostname === 'c.tenor.com' || hostname === 'i.imgur.com') return true
  if (hostname === 'litter.catbox.moe' || hostname === 'files.catbox.moe') return true
  if (hostname === 'image.prntscr.com' || hostname === 'image.prnt.sc') return true
  if (hostname === 'img.lightshot.app') return true
  if (/^media\d*\.tenor\.com$/.test(hostname)) return true
  if (/^img\d+\.prntscr\.com$/.test(hostname)) return true
  return false
}

function sanitizeResolvedUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value.startsWith('https://')) return null
  try {
    const url = new URL(value)
    if (url.username || url.password) return null
    if (!isAllowedResolvedHost(url.hostname)) return null
    return url.href
  } catch {
    return null
  }
}

function constructTwshotUrl(service: TwshotService, rawId: string): string | null {
  if (service === 'tenor') {
    const id = rawId.replace(/\.(?:gif|mp4|webm)$/i, '')
    return `https://c.tenor.com/${id}/tenor.gif`
  }

  if (service === 'imgur') {
    const id = rawId.replace(/\.(?:jpe?g|png|gif|webp)$/i, '')
    return `https://i.imgur.com/${id}.jpg`
  }

  if (service === 'litterbox') {
    return `https://litter.catbox.moe/${rawId}`
  }

  if (rawId.includes('.')) {
    return `https://img001.prntscr.com/file/img001/${rawId}`
  }

  return null
}

async function resolveFromTwshotApi(service: TwshotService, id: string): Promise<string | null> {
  const response = await fetch(
    `https://twshot.0r1.org/api/resolve?service=${encodeURIComponent(service)}&id=${encodeURIComponent(id)}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': BROWSER_UA
      }
    }
  )

  if (!response.ok) return null
  const payload = (await response.json()) as { url?: unknown }
  return sanitizeResolvedUrl(payload?.url)
}

function pickMetaContent(html: string, names: string[]): string | null {
  for (const name of names) {
    const propertyFirst = html.match(
      new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i')
    )
    if (propertyFirst?.[1]) return propertyFirst[1]

    const contentFirst = html.match(
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${name}["']`, 'i')
    )
    if (contentFirst?.[1]) return contentFirst[1]
  }
  return null
}

async function resolveLightshotPage(id: string): Promise<string | null> {
  const response = await fetch(`https://prnt.sc/${encodeURIComponent(id)}`, {
    method: 'GET',
    headers: {
      Accept: 'text/html',
      'User-Agent': BROWSER_UA
    }
  })

  if (!response.ok) return null
  const html = await response.text()
  const fromMeta = pickMetaContent(html, ['og:image', 'twitter:image', 'twitter:image:src'])
  const fromImg =
    html.match(/id=["']screenshot-image["'][^>]+src=["']([^"']+)["']/i)?.[1] ||
    html.match(/class=["'][^"']*screenshot-image[^"']*["'][^>]+src=["']([^"']+)["']/i)?.[1]

  return sanitizeResolvedUrl(fromMeta || fromImg)
}

async function resolveUncached(service: TwshotService, id: string): Promise<string | null> {
  const constructed = constructTwshotUrl(service, id)
  if (constructed) return constructed

  try {
    const fromApi = await resolveFromTwshotApi(service, id)
    if (fromApi) return fromApi
  } catch {
    // tenta a pagina do Lightshot abaixo
  }

  if (service === 'lightshot') {
    try {
      return await resolveLightshotPage(id)
    } catch {
      return null
    }
  }

  return constructed
}

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task)
  queue = run.then(
    () => new Promise((resolve) => setTimeout(resolve, 200)),
    () => undefined
  )
  return run
}

export async function resolveTwshotImage(
  rawService: string,
  rawId: string
): Promise<{ success: boolean; url?: string }> {
  const service = rawService.trim().toLowerCase()
  const id = rawId.trim()

  if (!isTwshotService(service) || !TWSHOT_ID.test(id) || id.includes('..')) {
    return { success: false }
  }

  const key = `${service}:${id}`
  if (cache.has(key)) {
    const cached = cache.get(key)
    return cached ? { success: true, url: cached } : { success: false }
  }

  const pending = inflight.get(key)
  if (pending) {
    const url = await pending
    return url ? { success: true, url } : { success: false }
  }

  const task = enqueue(async () => {
    if (cache.has(key)) return cache.get(key) ?? null
    const url = await resolveUncached(service, id)
    if (cache.size > 300) cache.clear()
    cache.set(key, url)
    return url
  })

  inflight.set(key, task)
  try {
    const url = await task
    return url ? { success: true, url } : { success: false }
  } finally {
    inflight.delete(key)
  }
}
