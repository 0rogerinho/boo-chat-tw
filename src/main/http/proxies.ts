const YOUTUBE_HOSTS = new Set(['www.youtube.com', 'youtube.com', 'm.youtube.com'])

function isAllowedYouTubeUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && YOUTUBE_HOSTS.has(parsed.hostname)
  } catch {
    return false
  }
}

function isAllowedTwitchProxyUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    const isLocal =
      parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || parsed.hostname === '::1'
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && isLocal
  } catch {
    return false
  }
}

export async function fetchYouTubeProxy(url: string, payload?: string) {
  if (!isAllowedYouTubeUrl(url)) {
    return { success: false, error: 'URL do YouTube não permitida' }
  }

  try {
    const options: RequestInit = {
      method: payload ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }

    if (payload) {
      options.body = payload
    }

    const response = await fetch(url, options)
    const contentType = response.headers.get('content-type') ?? ''
    const isJson = contentType.includes('application/json')

    if (!response.ok) {
      const errorBody = isJson ? await response.json() : await response.text()
      return {
        success: false,
        status: response.status,
        error: `HTTP ${response.status} ao acessar YouTube`,
        data: errorBody
      }
    }

    const data = isJson ? await response.json() : await response.text()
    return { success: true, data }
  } catch (error) {
    console.error('Erro ao fazer requisição ao YouTube:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
  }
}

export async function fetchTwitchApiProxy(url: string) {
  if (!isAllowedTwitchProxyUrl(url)) {
    return { success: false, error: 'URL da API Twitch não permitida' }
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    })

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        error: `HTTP ${response.status}`
      }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Erro ao fazer requisição à API Twitch:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
  }
}

export async function fetchKickChannelProxy(slug: string) {
  const cleanSlug = slug.trim().replace(/^@/, '')
  if (!/^[a-zA-Z0-9_-]{1,50}$/.test(cleanSlug)) {
    return { success: false, error: 'Slug do Kick inválido' }
  }

  try {
    const response = await fetch(`https://kick.com/api/v1/channels/${cleanSlug}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    })

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        error: `HTTP ${response.status} ao acessar Kick`
      }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Erro ao buscar canal da Kick:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }
  }
}
