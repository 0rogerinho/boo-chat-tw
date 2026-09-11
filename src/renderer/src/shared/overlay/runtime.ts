export const OVERLAY_API_ORIGIN = 'http://127.0.0.1:3847'

export const isElectronRuntime =
  typeof window !== 'undefined' && typeof window.electron?.ipcRenderer?.invoke === 'function'

export function isObsOverlayRoute(): boolean {
  if (typeof window === 'undefined') return false

  const pathname = window.location.pathname.replace(/\/+$/, '') || '/'
  if (pathname === '/overlay') return true

  const params = new URLSearchParams(window.location.search)
  if (params.get('overlay') === '1') return true

  const hash = window.location.hash.replace(/^#/, '')
  return hash === '/overlay' || hash.startsWith('/overlay?')
}

export function applyObsOverlayClass(): void {
  if (typeof document === 'undefined' || !isObsOverlayRoute()) return

  document.documentElement.classList.add('obs-overlay')
  document.documentElement.style.background = 'transparent'
  document.body?.classList.add('obs-overlay')
  if (document.body) {
    document.body.style.background = 'transparent'
  }
}

/** Base das APIs do overlay. Em 5173 (Vite) aponta para a porta 3847. */
export function getOverlayApiBase(): string {
  if (typeof window === 'undefined') return OVERLAY_API_ORIGIN

  const { hostname, port } = window.location
  const isLocal = hostname === '127.0.0.1' || hostname === 'localhost'
  if (isLocal && port === '3847') {
    return ''
  }

  return OVERLAY_API_ORIGIN
}
