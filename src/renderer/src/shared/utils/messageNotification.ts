import type { MessageSoundId } from '../constants/messageSounds'
import { parseMessageSound } from '../constants/messageSounds'

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  return audioCtx
}

function envelopeTone(
  ctx: AudioContext,
  freq: number,
  startOffset: number,
  durationSec: number,
  peakGain: number,
  volumeScale: number,
  type: OscillatorType = 'sine'
) {
  const scaled = peakGain * volumeScale
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startOffset)
  const t0 = ctx.currentTime + startOffset
  gain.gain.setValueAtTime(0.0001, t0)
  gain.gain.exponentialRampToValueAtTime(Math.max(scaled, 0.0002), t0 + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + durationSec)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(t0)
  osc.stop(t0 + durationSec + 0.03)
}

/** Mensagens de conexão / ajuda das plataformas — não disparam alerta sonoro */
export function isChatSystemNoticeMessage(payload: {
  author: { name: string }
  message: { text: string }
}): boolean {
  const name = payload.author?.name ?? ''
  const upper = name.toUpperCase()
  const text = payload.message?.text ?? ''

  if (
    upper === 'CONEXAO' ||
    upper === 'CONNECTION' ||
    upper === 'CONEXION' ||
    upper === 'CONNEXION' ||
    upper === 'VERBINDUNG' ||
    upper === 'CONNESSIONE' ||
    upper === 'AJUDA' ||
    upper === 'HELP' ||
    upper === 'AYUDA' ||
    upper === 'AIDE' ||
    upper === 'HILFE' ||
    upper === 'AIUTO'
  ) {
    return true
  }
  if (name === 'Kick-connect') return true
  if (name === 'YouTube-connect') return true
  if (text.includes('Connecting to channel')) return true
  if (text.includes('Conectando')) return true
  if (text.includes('Connexion')) return true
  if (text.includes('Verbinde mit Kanal')) return true
  if (text.includes('Connessione al canale')) return true
  if (text.includes('Connected to')) return true
  if (text.includes('Conectado')) return true
  if (text.includes('Connecte')) return true
  if (text.includes('verbunden')) return true
  if (text.includes('non trovato')) return true
  if (text.includes('nao foi encontrado')) return true
  if (text.includes('was not found')) return true
  if (text.includes('No se encontro')) return true
  if (text.includes('introuvable')) return true
  if (text.includes('wurde nicht gefunden')) return true
  return false
}

/** Toca um som integrado (Web Audio). `volumeScale` entre 0 e 1. */
export async function playBuiltinMessageSound(
  kind: MessageSoundId,
  volumeScale: number
): Promise<void> {
  if (kind === 'none' || typeof window === 'undefined') return
  const v = Math.min(1, Math.max(0, volumeScale))
  if (v <= 0) return

  const ctx = getAudioContext()
  try {
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }
  } catch {
    return
  }

  switch (kind) {
    case 'ding':
      envelopeTone(ctx, 880, 0, 0.11, 0.28, v)
      break
    case 'soft':
      envelopeTone(ctx, 520, 0, 0.22, 0.14, v)
      break
    case 'bubble':
      envelopeTone(ctx, 620, 0, 0.06, 0.2, v)
      envelopeTone(ctx, 780, 0.07, 0.07, 0.18, v)
      break
    default:
      break
  }
}

export type IncomingMessageSoundInput = {
  messageSound?: MessageSoundId
  messageSoundVolume?: number
}

/**
 * Alerta ao receber mensagem: silencia se pré-definição for "none".
 * Em volume 0% não toca.
 */
export async function playIncomingMessageNotification(
  settings: IncomingMessageSoundInput
): Promise<void> {
  const kind = parseMessageSound(settings.messageSound)
  if (kind === 'none') return

  const volumePct =
    typeof settings.messageSoundVolume === 'number' && Number.isFinite(settings.messageSoundVolume)
      ? settings.messageSoundVolume
      : 85
  const volume01 = Math.min(1, Math.max(0, volumePct / 100))
  if (volume01 <= 0) return

  await playBuiltinMessageSound(kind, volume01)
}
