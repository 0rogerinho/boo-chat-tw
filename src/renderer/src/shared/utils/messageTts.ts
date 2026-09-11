import type { AppLanguageCode } from '../i18n'
import { normalizeLanguage } from '../i18n'
import { resolveTtsVoice, type TtsVoiceId } from '../constants/ttsVoices'

const MAX_QUEUED_CLIPS = 6
const MAX_SPEECH_CHARS = 220

const LAUGH_BY_LANGUAGE: Record<AppLanguageCode, string> = {
  'pt-BR': 'risos',
  'en-US': 'laughs',
  'es-ES': 'risas',
  'fr-FR': 'rire',
  'de-DE': 'lacht',
  'it-IT': 'ride'
}

let queuedCount = 0
let playToken = 0
let playbackCtx: AudioContext | null = null
let currentSource: AudioBufferSourceNode | null = null
const clipQueue: Array<{ bytes: Uint8Array; volume: number }> = []
let playing = false

function clampVolume(value: unknown, fallback = 85): number {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? parseFloat(value) : NaN
  if (!Number.isFinite(n)) return fallback
  return Math.min(100, Math.max(0, Math.round(n)))
}

function clampRate(value: unknown, fallback = 1): number {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? parseFloat(value) : NaN
  if (!Number.isFinite(n)) return fallback
  return Math.min(2, Math.max(0.5, Math.round(n * 10) / 10))
}

export function parseTtsEnabled(value: unknown): boolean {
  return value === true
}

export function parseTtsReadAuthor(value: unknown): boolean {
  return value !== false
}

export function parseTtsVolume(value: unknown, fallback = 85): number {
  return clampVolume(value, fallback)
}

export function parseTtsRate(value: unknown, fallback = 1): number {
  return clampRate(value, fallback)
}

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function collapseStretchedLetters(text: string): string {
  return text.replace(/([^\s])\1{3,}/g, '$1$1$1')
}

function softenCaps(text: string): string {
  const letters = text.replace(/[^a-zA-ZÀ-ÿ]/g, '')
  if (letters.length < 8) return text
  const upper = letters.replace(/[^A-ZÀ-ÿ]/g, '').length
  if (upper / letters.length < 0.7) return text
  return text.toLocaleLowerCase()
}

const SPEAKER_CUE_BY_LANGUAGE: Record<AppLanguageCode, string> = {
  'pt-BR': '{name} falou',
  'en-US': '{name} said',
  'es-ES': '{name} hablo',
  'fr-FR': '{name} a dit',
  'de-DE': '{name} sagte',
  'it-IT': '{name} ha detto'
}

export function humanizeSpeakerName(name: string): string {
  let text = name.trim().replace(/^@+/, '')
  text = text.replace(/[_.\-]+/g, ' ')
  text = text.replace(/([a-zà-ÿ])([A-ZÀ-ÿ])/g, '$1 $2')
  text = text.replace(/\d{2,}$/g, '')
  text = text.replace(/\s+/g, ' ').trim()
  return text.length >= 2 ? text : ''
}

export function formatSpeakerCue(name: string, language: AppLanguageCode): string {
  const nick = name.trim().replace(/^@+/, '')
  if (nick.length < 1) return ''
  return SPEAKER_CUE_BY_LANGUAGE[language].replace('{name}', nick)
}

export function stripMessageForSpeech(raw: string, language: AppLanguageCode): string {
  if (!raw) return ''

  let text = raw
  text = text.replace(/\[emote:\d+:[^\]]+\]/gi, ' ')
  text = text.replace(/<img[^>]*>/gi, ' ')
  text = text.replace(/<[^>]+>/g, ' ')
  text = decodeEntities(text)
  text = text.replace(/https?:\/\/\S+/gi, ' ')
  text = text.replace(/www\.\S+/gi, ' ')
  text = text.replace(/@[A-Za-z0-9_.\-]+/g, (match) => ` ${humanizeSpeakerName(match)} `)
  text = text.replace(/#(\w+)/g, ' $1 ')
  text = text.replace(/\b(?:lul|kekw|pog|poggers|kappa|4head|cmonbruh|omonobruh|omegalul)\b/gi, ' ')
  text = text.replace(/(?:[:;=8][-']?[)(/\\DpPOo]|<3|:\*|xD|xd)/g, ' ')
  text = text.replace(/\b(?:k{3,}|(?:ha){2,}|(?:hue){2,}|(?:rs){2,})\b/gi, ` ${LAUGH_BY_LANGUAGE[language]} `)
  text = text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, ' ')
  text = collapseStretchedLetters(text)
  text = softenCaps(text)
  text = text.replace(/[_*|~^`]+/g, ' ')
  text = text.replace(/\s+/g, ' ').trim()

  if (text.length > MAX_SPEECH_CHARS) {
    text = `${text.slice(0, MAX_SPEECH_CHARS).trim()}...`
  }

  if (text && !/[.!?…]$/.test(text)) {
    text = `${text}.`
  }

  return text
}

function decodeBase64Audio(value: string): Uint8Array | null {
  try {
    const binary = atob(value)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes
  } catch {
    return null
  }
}

function toAudioBytes(payload: { audio?: unknown; audioBase64?: unknown }): Uint8Array | null {
  if (typeof payload.audioBase64 === 'string' && payload.audioBase64.length > 0) {
    return decodeBase64Audio(payload.audioBase64)
  }

  const audio = payload.audio
  if (!audio) return null
  if (audio instanceof Uint8Array) return audio
  if (audio instanceof ArrayBuffer) return new Uint8Array(audio)
  if (Array.isArray(audio)) return Uint8Array.from(audio)
  if (typeof audio === 'object' && 'data' in audio && Array.isArray((audio as { data: unknown }).data)) {
    return Uint8Array.from((audio as { data: number[] }).data)
  }
  return null
}

function getPlaybackContext(): AudioContext {
  if (!playbackCtx || playbackCtx.state === 'closed') {
    playbackCtx = new AudioContext()
  }
  return playbackCtx
}

export async function unlockTtsAudio(): Promise<void> {
  if (typeof window === 'undefined') return
  const ctx = getPlaybackContext()
  if (ctx.state === 'suspended') {
    await ctx.resume()
  }
}

function stopCurrentAudio() {
  if (!currentSource) return
  try {
    currentSource.stop()
  } catch {
    // ja parado
  }
  currentSource = null
}

async function playBytes(bytes: Uint8Array, volume: number, token: number): Promise<void> {
  const ctx = getPlaybackContext()
  if (ctx.state === 'suspended') {
    await ctx.resume()
  }

  const copy = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(copy).set(bytes)
  const decoded = await ctx.decodeAudioData(copy)
  if (token !== playToken) return

  const source = ctx.createBufferSource()
  const gain = ctx.createGain()
  gain.gain.value = Math.min(1, Math.max(0, volume))
  source.buffer = decoded
  source.connect(gain)
  gain.connect(ctx.destination)
  currentSource = source

  await new Promise<void>((resolve, reject) => {
    source.onended = () => resolve()
    try {
      source.start()
    } catch (error) {
      reject(error instanceof Error ? error : new Error('Falha ao tocar audio TTS'))
    }
  })

  if (currentSource === source) currentSource = null
}

async function pumpQueue() {
  if (playing) return
  playing = true

  try {
    while (clipQueue.length > 0) {
      const token = playToken
      const next = clipQueue.shift()
      if (!next || token !== playToken) break
      queuedCount = Math.max(0, queuedCount - 1)
      try {
        await playBytes(next.bytes, next.volume, token)
      } catch {
        // Se um clip falhar, segue para o proximo
      }
      if (token !== playToken) break
    }
  } finally {
    playing = false
  }
}

function enqueueClip(bytes: Uint8Array, volume: number) {
  if (clipQueue.length >= MAX_QUEUED_CLIPS) return
  clipQueue.push({ bytes, volume })
  queuedCount += 1
  void pumpQueue()
}

function pickSystemVoice(lang: AppLanguageCode): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null
  const voices = window.speechSynthesis.getVoices()
  if (voices.length === 0) return null

  const scored = voices
    .map((voice) => {
      const name = voice.name.toLowerCase()
      const voiceLang = voice.lang.replace('_', '-')
      let score = 0
      if (voiceLang === lang) score += 20
      else if (voiceLang.toLowerCase().startsWith(lang.split('-')[0])) score += 10
      if (/neural|natural|online|premium|google|enhanced/.test(name)) score += 40
      if (/desktop|sapi/.test(name)) score -= 25
      return { voice, score }
    })
    .sort((a, b) => b.score - a.score)

  return scored[0]?.voice ?? null
}

function speakWithSystemVoice(text: string, language: AppLanguageCode, volume: number, rate: number) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = language
  utterance.volume = volume
  utterance.rate = Math.min(1.15, Math.max(0.75, rate * 0.92))
  utterance.pitch = 1.05
  const voice = pickSystemVoice(language)
  if (voice) utterance.voice = voice
  window.speechSynthesis.speak(utterance)
}

export type IncomingMessageTtsInput = {
  ttsEnabled?: boolean
  ttsVolume?: number
  ttsRate?: number
  ttsReadAuthor?: boolean
  ttsVoice?: TtsVoiceId
}

export function cancelMessageTts() {
  playToken += 1
  queuedCount = 0
  clipQueue.length = 0
  stopCurrentAudio()
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}

export async function speakIncomingChatMessage(options: {
  author: string
  message: string
  language?: unknown
  settings: IncomingMessageTtsInput
}): Promise<boolean> {
  if (typeof window === 'undefined') return false

  const enabled = parseTtsEnabled(options.settings.ttsEnabled)
  if (!enabled) return false

  const volumePct = parseTtsVolume(options.settings.ttsVolume)
  if (volumePct <= 0) return false
  if (queuedCount >= MAX_QUEUED_CLIPS) return false

  const language = normalizeLanguage(options.language)
  const spokenMessage = stripMessageForSpeech(options.message, language)
  if (!spokenMessage) return false

  const spokenLetters = spokenMessage.replace(/[.!?…]+$/g, '').replace(/[^a-zA-ZÀ-ÿ]/g, '')
  if (spokenLetters.length < 2) return false

  const readAuthor = parseTtsReadAuthor(options.settings.ttsReadAuthor)
  const spokenAuthor = readAuthor ? formatSpeakerCue(options.author, language) : ''
  const fallbackText = spokenAuthor ? `${spokenAuthor}. ${spokenMessage}` : spokenMessage
  const volume = Math.min(1, Math.max(0, volumePct / 100))
  const rate = parseTtsRate(options.settings.ttsRate)
  const voice = resolveTtsVoice(options.settings.ttsVoice, language)

  queuedCount += 1
  const token = playToken

  try {
    await unlockTtsAudio()
    const response = await window.electron.ipcRenderer.invoke('tts-synthesize', {
      text: spokenMessage,
      author: spokenAuthor,
      voice,
      rate
    })

    queuedCount = Math.max(0, queuedCount - 1)
    if (token !== playToken) return false

    const bytes = response?.success ? toAudioBytes(response) : null
    if (bytes) {
      enqueueClip(bytes, volume)
      return true
    }
  } catch (error) {
    queuedCount = Math.max(0, queuedCount - 1)
    if (token !== playToken) return false
    console.error('Erro ao gerar voz neural:', error)
  }

  speakWithSystemVoice(fallbackText, language, volume, rate)
  return false
}
