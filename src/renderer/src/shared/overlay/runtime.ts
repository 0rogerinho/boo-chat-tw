export const isElectronRuntime =
  typeof window !== 'undefined' && typeof window.electron?.ipcRenderer?.invoke === 'function'

export function isObsOverlayRoute(): boolean {
  if (typeof window === 'undefined') return false

  const params = new URLSearchParams(window.location.search)
  if (params.get('overlay') === '1') return true

  const hash = window.location.hash.replace(/^#/, '')
  return hash === '/overlay' || hash.startsWith('/overlay?')
}
