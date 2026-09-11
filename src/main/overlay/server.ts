import http from 'http'
import fs from 'fs'
import path from 'path'
import { is } from '@electron-toolkit/utils'
import { loadAppConfig } from '../config/store'
import { fetchKickChannelProxy, fetchTwitchApiProxy, fetchYouTubeProxy } from '../http/proxies'
import { onOverlayEvent, type OverlayEventName } from './bus'

export const OVERLAY_HOST = '127.0.0.1'
export const OVERLAY_PORT = 3847
export const OVERLAY_URL = `http://${OVERLAY_HOST}:${OVERLAY_PORT}/overlay`

function getDevOverlayUrl(): string | null {
  const viteOrigin = process.env['ELECTRON_RENDERER_URL']?.replace(/\/$/, '')
  if (!is.dev || !viteOrigin) {
    return null
  }

  return `${viteOrigin}/overlay`
}

const HOST = OVERLAY_HOST

const OVERLAY_CSP =
  "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; media-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' http://127.0.0.1:3847 http://localhost:3847 http://127.0.0.1:5173 http://localhost:5173 ws://127.0.0.1:5173 ws://localhost:5173 wss://irc-ws.chat.twitch.tv wss://ws-mt1.pusher.com wss://ws-us2.pusher.com wss://ws-eu.pusher.com wss://ws-ap-southeast-1.pusher.com wss://ws-us-east-1.pusher.com https://kick.com https://api.kick.com https://www.youtube.com https://youtube.com https://m.youtube.com; frame-src 'none'"

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json'
}

let overlayServer: http.Server | null = null
let overlayPort: number | null = null

function applyCors(res: http.ServerResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function sendJson(res: http.ServerResponse, status: number, payload: unknown): void {
  applyCors(res)
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(payload))
}

function readJsonBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8')
      if (!raw) {
        resolve({})
        return
      }
      try {
        resolve(JSON.parse(raw))
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

function rewriteHtmlCsp(html: string): string {
  if (html.includes('http-equiv="Content-Security-Policy"')) {
    return html.replace(
      /<meta http-equiv="Content-Security-Policy" content="[^"]*" \/>/,
      `<meta http-equiv="Content-Security-Policy" content="${OVERLAY_CSP}" />`
    )
  }

  return html.replace(
    '<head>',
    `<head>\n  <meta http-equiv="Content-Security-Policy" content="${OVERLAY_CSP}" />`
  )
}

function stripViteHmr(html: string): string {
  return html
    .replace(/<script type="module">\s*import RefreshRuntime[\s\S]*?<\/script>/, '')
    .replace(/<script type="module" src="\/@vite\/client"><\/script>/, '')
}

function prepareOverlayHtml(html: string): string {
  return stripViteHmr(rewriteHtmlCsp(html))
}

function viteProxyTarget(reqUrl: string, viteUrl: string): URL {
  const incoming = new URL(reqUrl || '/', 'http://127.0.0.1')
  if (incoming.pathname === '/overlay' || incoming.pathname === '/overlay/') {
    incoming.pathname = '/'
  }
  return new URL(`${incoming.pathname}${incoming.search}`, viteUrl)
}

async function proxyToVite(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  viteUrl: string
): Promise<void> {
  const target = viteProxyTarget(req.url || '/', viteUrl)

  try {
    const proxied = await fetch(target, {
      method: req.method,
      headers: {
        Accept: req.headers.accept ?? '*/*'
      }
    })

    const contentType = proxied.headers.get('content-type') || 'application/octet-stream'
    let body = Buffer.from(await proxied.arrayBuffer())

    if (contentType.includes('text/html')) {
      body = Buffer.from(prepareOverlayHtml(body.toString('utf8')))
    }

    applyCors(res)
    res.writeHead(proxied.status, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store'
    })
    res.end(body)
  } catch (error) {
    console.error('Erro ao fazer proxy do overlay para o Vite:', error)
    res.writeHead(502)
    res.end('Falha ao carregar overlay')
  }
}

function serveRendererFile(req: http.IncomingMessage, res: http.ServerResponse): void {
  const rendererRoot = path.resolve(path.join(__dirname, '../renderer'))
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
  const normalizedPath = urlPath === '/overlay' || urlPath === '/overlay/' ? '/' : urlPath
  const safePath = path.normalize(normalizedPath).replace(/^(\.\.[/\\])+/, '')
  let filePath = path.join(rendererRoot, safePath === '/' || safePath === '\\' ? 'index.html' : safePath)

  if (!filePath.startsWith(rendererRoot)) {
    res.writeHead(403)
    res.end()
    return
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(rendererRoot, 'index.html')
  }

  const ext = path.extname(filePath).toLowerCase()
  const mime = MIME_TYPES[ext] || 'application/octet-stream'

  try {
    let body = fs.readFileSync(filePath)
    if (ext === '.html') {
      body = Buffer.from(prepareOverlayHtml(body.toString('utf8')))
    }

    applyCors(res)
    res.writeHead(200, { 'Content-Type': mime })
    res.end(body)
  } catch (error) {
    console.error('Erro ao servir arquivo do overlay:', error)
    res.writeHead(404)
    res.end('Not found')
  }
}

function handleSse(res: http.ServerResponse): void {
  applyCors(res)
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive'
  })
  res.write(': connected\n\n')

  const writeEvent = (event: OverlayEventName, payload: unknown) => {
    res.write(`event: ${event}\n`)
    res.write(`data: ${JSON.stringify(payload)}\n\n`)
  }

  const unsubscribers = [
    onOverlayEvent('tiktok-chat', (payload) => writeEvent('tiktok-chat', payload)),
    onOverlayEvent('tiktok-status', (payload) => writeEvent('tiktok-status', payload)),
    onOverlayEvent('config-updated', (payload) => writeEvent('config-updated', payload))
  ]

  const heartbeat = setInterval(() => {
    res.write(': ping\n\n')
  }, 15000)

  res.on('close', () => {
    clearInterval(heartbeat)
    unsubscribers.forEach((unsubscribe) => unsubscribe())
  })
}

async function handleApi(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  url: URL
): Promise<boolean> {
  if (req.method === 'OPTIONS' && url.pathname.startsWith('/api/')) {
    applyCors(res)
    res.writeHead(204)
    res.end()
    return true
  }

  if (url.pathname === '/api/health' && req.method === 'GET') {
    sendJson(res, 200, { ok: true, name: 'boochat-overlay', url: OVERLAY_URL })
    return true
  }

  if (url.pathname === '/api/config' && req.method === 'GET') {
    sendJson(res, 200, loadAppConfig())
    return true
  }

  if (url.pathname === '/api/events' && req.method === 'GET') {
    handleSse(res)
    return true
  }

  if (url.pathname === '/api/youtube' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req)
      const targetUrl = typeof body.url === 'string' ? body.url : ''
      const payload = typeof body.payload === 'string' ? body.payload : undefined
      sendJson(res, 200, await fetchYouTubeProxy(targetUrl, payload))
    } catch {
      sendJson(res, 400, { success: false, error: 'JSON inválido' })
    }
    return true
  }

  if (url.pathname === '/api/twitch' && req.method === 'GET') {
    const targetUrl = url.searchParams.get('url') ?? ''
    sendJson(res, 200, await fetchTwitchApiProxy(targetUrl))
    return true
  }

  if (url.pathname.startsWith('/api/kick/channels/') && req.method === 'GET') {
    const slug = decodeURIComponent(url.pathname.slice('/api/kick/channels/'.length))
    sendJson(res, 200, await fetchKickChannelProxy(slug))
    return true
  }

  if (url.pathname === '/api/tiktok/connect' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req)
      const channel = typeof body.channel === 'string' ? body.channel : ''
      const { connectTikTokChannel } = await import('../home/ipc')
      sendJson(res, 200, await connectTikTokChannel(channel))
    } catch {
      sendJson(res, 400, { success: false, error: 'JSON inválido' })
    }
    return true
  }

  if (url.pathname === '/api/tiktok/disconnect' && req.method === 'POST') {
    const { disconnectTikTokChannel } = await import('../home/ipc')
    sendJson(res, 200, await disconnectTikTokChannel())
    return true
  }

  return false
}

async function requestListener(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  const url = new URL(req.url || '/', `http://${HOST}`)

  try {
    if (await handleApi(req, res, url)) {
      return
    }

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      await proxyToVite(req, res, process.env['ELECTRON_RENDERER_URL'])
      return
    }

    serveRendererFile(req, res)
  } catch (error) {
    console.error('Erro no servidor de overlay:', error)
    if (!res.headersSent) {
      res.writeHead(500)
      res.end('Internal overlay server error')
    }
  }
}

function listenOnFixedPort(server: http.Server): Promise<number> {
  return new Promise((resolve, reject) => {
    const onError = (error: NodeJS.ErrnoException) => {
      server.off('listening', onListening)
      reject(error)
    }

    const onListening = () => {
      server.off('error', onError)
      resolve(OVERLAY_PORT)
    }

    server.once('error', onError)
    server.once('listening', onListening)
    server.listen(OVERLAY_PORT, HOST)
  })
}

export async function startOverlayServer(): Promise<string | null> {
  if (overlayServer && overlayPort) {
    return getOverlayUrl()
  }

  const server = http.createServer((req, res) => {
    void requestListener(req, res)
  })

  try {
    overlayPort = await listenOnFixedPort(server)
    overlayServer = server
    console.log(`[Overlay] Browser Source disponível em ${getOverlayUrl()}`)
    return getOverlayUrl()
  } catch (error) {
    console.error('Não foi possível iniciar o servidor de overlay:', error)
    overlayServer = null
    overlayPort = null
    return null
  }
}

export function stopOverlayServer(): void {
  if (!overlayServer) return

  overlayServer.close()
  overlayServer = null
  overlayPort = null
}

export function getOverlayUrl(): string {
  return getDevOverlayUrl() ?? OVERLAY_URL
}

export function getOverlayPort(): number {
  return OVERLAY_PORT
}
