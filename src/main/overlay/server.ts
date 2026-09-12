import http from 'http'
import fs from 'fs'
import path from 'path'
import express, { type NextFunction, type Request, type Response } from 'express'
import { is } from '@electron-toolkit/utils'
import { loadAppConfig } from '../config/store'
import {
  fetchEmotesApiProxy,
  fetchKickChannelProxy,
  fetchTwitchApiProxy,
  fetchYouTubeProxy
} from '../http/proxies'
import { resolveTwshotImage } from '../http/twshot'
import { onOverlayEvent, type OverlayEventName } from './bus'

const PREFERRED_PORT = 3847
const HOST = '127.0.0.1'

const OVERLAY_CSP =
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; media-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' http://127.0.0.1:* http://localhost:* ws://127.0.0.1:* ws://localhost:* wss://irc-ws.chat.twitch.tv wss://ws-mt1.pusher.com wss://ws-us2.pusher.com wss://ws-eu.pusher.com wss://ws-ap-southeast-1.pusher.com wss://ws-us-east-1.pusher.com https://kick.com https://api.kick.com https://www.youtube.com https://youtube.com https://m.youtube.com https://events.7tv.io https://twshot.0r1.org; frame-src 'none'"

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

function applyCors(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  next()
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

async function proxyToVite(req: Request, res: Response, viteUrl: string): Promise<void> {
  const target = new URL(req.originalUrl || req.url, viteUrl)

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
      body = Buffer.from(rewriteHtmlCsp(body.toString('utf8')))
    }

    res.status(proxied.status)
    res.setHeader('Content-Type', contentType)
    res.end(body)
  } catch (error) {
    console.error('Erro ao fazer proxy do overlay para o Vite:', error)
    res.status(502).send('Falha ao carregar overlay')
  }
}

function getRendererRoot(): string {
  return path.resolve(path.join(__dirname, '../renderer'))
}

function sendIndexHtml(res: Response): void {
  const indexPath = path.join(getRendererRoot(), 'index.html')
  const html = rewriteHtmlCsp(fs.readFileSync(indexPath, 'utf8'))
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.send(html)
}

function serveRendererFile(req: Request, res: Response): void {
  const rendererRoot = getRendererRoot()
  const urlPath = decodeURIComponent((req.path || '/').split('?')[0])
  const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '')
  let filePath = path.join(
    rendererRoot,
    safePath === '/' || safePath === '\\' ? 'index.html' : safePath
  )

  if (!filePath.startsWith(rendererRoot)) {
    res.status(403).end()
    return
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    sendIndexHtml(res)
    return
  }

  const ext = path.extname(filePath).toLowerCase()
  const mime = MIME_TYPES[ext] || 'application/octet-stream'

  try {
    let body: Buffer | string = fs.readFileSync(filePath)
    if (ext === '.html') {
      body = rewriteHtmlCsp(body.toString('utf8'))
    }

    res.setHeader('Content-Type', mime)
    res.send(body)
  } catch (error) {
    console.error('Erro ao servir arquivo do overlay:', error)
    res.status(404).send('Not found')
  }
}

function handleSse(_req: Request, res: Response): void {
  res.status(200)
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()
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

function createExpressApp(): express.Express {
  const app = express()
  const api = express.Router()

  app.disable('x-powered-by')
  app.use(applyCors)
  app.options('*', (_req, res) => {
    res.sendStatus(204)
  })

  api.use(express.json({ limit: '1mb' }))

  api.get('/config', (_req, res) => {
    res.json(loadAppConfig())
  })

  api.get('/events', handleSse)

  api.post('/youtube', async (req, res) => {
    const targetUrl = typeof req.body?.url === 'string' ? req.body.url : ''
    const payload = typeof req.body?.payload === 'string' ? req.body.payload : undefined
    res.json(await fetchYouTubeProxy(targetUrl, payload))
  })

  api.get('/twitch', async (req, res) => {
    const targetUrl = typeof req.query.url === 'string' ? req.query.url : ''
    res.json(await fetchTwitchApiProxy(targetUrl))
  })

  api.get('/emotes', async (req, res) => {
    const targetUrl = typeof req.query.url === 'string' ? req.query.url : ''
    res.json(await fetchEmotesApiProxy(targetUrl))
  })

  api.get('/kick/channels/:slug', async (req, res) => {
    res.json(await fetchKickChannelProxy(req.params.slug))
  })

  api.get('/twshot/resolve', async (req, res) => {
    const service = typeof req.query.service === 'string' ? req.query.service : ''
    const id = typeof req.query.id === 'string' ? req.query.id : ''
    res.json(await resolveTwshotImage(service, id))
  })

  api.post('/tiktok/connect', async (req, res) => {
    const channel = typeof req.body?.channel === 'string' ? req.body.channel : ''
    const { connectTikTokChannel } = await import('../home/ipc')
    res.json(await connectTikTokChannel(channel))
  })

  api.post('/tiktok/disconnect', async (_req, res) => {
    const { disconnectTikTokChannel } = await import('../home/ipc')
    res.json(await disconnectTikTokChannel())
  })

  app.use('/api', api)

  app.use(async (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      next()
      return
    }

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      await proxyToVite(req, res, process.env['ELECTRON_RENDERER_URL'])
      return
    }

    serveRendererFile(req, res)
  })

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof SyntaxError) {
      res.status(400).json({ success: false, error: 'JSON inválido' })
      return
    }

    console.error('Erro no servidor HTTP local:', error)
    if (!res.headersSent) {
      res.status(500).send('Internal overlay server error')
    }
  })

  return app
}

function listenOnPort(server: http.Server, port: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const onError = (error: NodeJS.ErrnoException) => {
      server.off('listening', onListening)
      if (error.code === 'EADDRINUSE' && port < PREFERRED_PORT + 20) {
        resolve(listenOnPort(server, port + 1))
        return
      }
      reject(error)
    }

    const onListening = () => {
      server.off('error', onError)
      resolve(port)
    }

    server.once('error', onError)
    server.once('listening', onListening)
    server.listen(port, HOST)
  })
}

export async function startOverlayServer(): Promise<string | null> {
  if (overlayServer && overlayPort) {
    return getLocalServerUrl()
  }

  const app = createExpressApp()
  const server = http.createServer(app)

  try {
    overlayPort = await listenOnPort(server, PREFERRED_PORT)
    overlayServer = server
    console.log(`[HTTP] App disponível em ${getLocalServerUrl()}`)
    console.log(`[HTTP] Overlay OBS disponível em ${getOverlayUrl()}`)
    return getLocalServerUrl()
  } catch (error) {
    console.error('Não foi possível iniciar o servidor HTTP local:', error)
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

export function getLocalServerUrl(): string | null {
  if (!overlayPort) return null
  return `http://${HOST}:${overlayPort}/`
}

export function getOverlayUrl(): string | null {
  if (!overlayPort) return null
  return `http://${HOST}:${overlayPort}/#/overlay`
}

export function getOverlayPort(): number | null {
  return overlayPort
}
