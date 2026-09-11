import type { AppLanguageCode } from '../i18n'

export const TTS_VOICE_IDS = ['auto', 'pt-BR-faber', 'pt-BR-cadu', 'pt-BR-jeff'] as const

export type TtsVoiceId = (typeof TTS_VOICE_IDS)[number]

export type TtsVoiceOption = {
  id: Exclude<TtsVoiceId, 'auto'>
  language: AppLanguageCode
  name: string
}

export const TTS_VOICE_OPTIONS: TtsVoiceOption[] = [
  { id: 'pt-BR-faber', language: 'pt-BR', name: 'Faber' },
  { id: 'pt-BR-cadu', language: 'pt-BR', name: 'Cadu' },
  { id: 'pt-BR-jeff', language: 'pt-BR', name: 'Jeff' }
]

const LEGACY_VOICE_MAP: Record<string, TtsVoiceId> = {
  'pt-BR-FranciscaNeural': 'pt-BR-faber',
  'pt-BR-AntonioNeural': 'pt-BR-cadu',
  'pt-BR-ThalitaNeural': 'pt-BR-jeff',
  'en-US-JennyNeural': 'auto',
  'en-US-GuyNeural': 'auto',
  'es-ES-ElviraNeural': 'auto',
  'es-ES-AlvaroNeural': 'auto',
  'fr-FR-DeniseNeural': 'auto',
  'fr-FR-HenriNeural': 'auto',
  'de-DE-KatjaNeural': 'auto',
  'de-DE-ConradNeural': 'auto',
  'it-IT-ElsaNeural': 'auto',
  'it-IT-DiegoNeural': 'auto'
}

export function parseTtsVoice(value: unknown): TtsVoiceId {
  if (typeof value === 'string' && TTS_VOICE_IDS.includes(value as TtsVoiceId)) {
    return value as TtsVoiceId
  }
  if (typeof value === 'string' && value in LEGACY_VOICE_MAP) {
    return LEGACY_VOICE_MAP[value]
  }
  return 'auto'
}

export function resolveTtsVoice(
  voice: unknown,
  _language: AppLanguageCode
): Exclude<TtsVoiceId, 'auto'> {
  const parsed = parseTtsVoice(voice)
  if (parsed !== 'auto') return parsed
  return 'pt-BR-faber'
}

export function getTtsVoicesForLanguage(_language: AppLanguageCode): TtsVoiceOption[] {
  return TTS_VOICE_OPTIONS
}
