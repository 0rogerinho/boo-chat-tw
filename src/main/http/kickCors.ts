import { session } from 'electron'

let installed = false

export function installKickCorsBypass(): void {
  if (installed) return
  installed = true

  session.defaultSession.webRequest.onHeadersReceived(
    { urls: ['https://kick.com/*', 'https://web.kick.com/*'] },
    (details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Access-Control-Allow-Origin': ['*'],
          'Access-Control-Allow-Headers': ['Content-Type', 'Accept', 'x-app-platform'],
          'Access-Control-Allow-Methods': ['GET, POST, OPTIONS']
        }
      })
    }
  )
}
