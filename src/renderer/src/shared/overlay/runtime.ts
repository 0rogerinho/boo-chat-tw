export const isElectronRuntime =
  typeof window !== 'undefined' && typeof window.electron?.ipcRenderer?.invoke === 'function'

function currentHashPath(): string {
  if (typeof window === 'undefined') return ''
  return window.location.hash.replace(/^#/, '')
}

export function isObsOverlayRoute(): boolean {
  if (typeof window === 'undefined') return false

  const params = new URLSearchParams(window.location.search)
  if (params.get('overlay') === '1') return true

  const hash = currentHashPath()
  return hash === '/overlay' || hash.startsWith('/overlay?')
}

export function isLiveRoute(): boolean {
  if (typeof window === 'undefined') return false

  const params = new URLSearchParams(window.location.search)
  if (params.get('live') === '1') return true

  const hash = currentHashPath()
  return hash === '/live' || hash.startsWith('/live?')
}
