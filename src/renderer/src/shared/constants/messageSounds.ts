export const MESSAGE_SOUND_IDS = ['none', 'ding', 'soft', 'bubble'] as const

export type MessageSoundId = (typeof MESSAGE_SOUND_IDS)[number]

const MESSAGE_SOUND_LABELS_BY_LANGUAGE = {
  'pt-BR': {
    none: 'Nenhum',
    ding: 'Sino curto',
    soft: 'Toque suave',
    bubble: 'Bolhas'
  },
  'en-US': {
    none: 'None',
    ding: 'Short bell',
    soft: 'Soft tone',
    bubble: 'Bubbles'
  },
  'es-ES': {
    none: 'Ninguno',
    ding: 'Campana corta',
    soft: 'Tono suave',
    bubble: 'Burbujas'
  },
  'fr-FR': {
    none: 'Aucun',
    ding: 'Cloche courte',
    soft: 'Son doux',
    bubble: 'Bulles'
  },
  'de-DE': {
    none: 'Kein',
    ding: 'Kurzer Klingelton',
    soft: 'Sanfter Ton',
    bubble: 'Blasen'
  },
  'it-IT': {
    none: 'Nessuno',
    ding: 'Campanello breve',
    soft: 'Tono morbido',
    bubble: 'Bolle'
  }
} as const

export const MESSAGE_SOUND_LABELS: Record<MessageSoundId, string> =
  MESSAGE_SOUND_LABELS_BY_LANGUAGE['pt-BR']

export function getMessageSoundLabels(
  language: keyof typeof MESSAGE_SOUND_LABELS_BY_LANGUAGE | string | undefined
): Record<MessageSoundId, string> {
  if (language && language in MESSAGE_SOUND_LABELS_BY_LANGUAGE) {
    return MESSAGE_SOUND_LABELS_BY_LANGUAGE[language as keyof typeof MESSAGE_SOUND_LABELS_BY_LANGUAGE]
  }
  return MESSAGE_SOUND_LABELS_BY_LANGUAGE['pt-BR']
}

export function parseMessageSound(value: unknown): MessageSoundId {
  if (typeof value === 'string' && MESSAGE_SOUND_IDS.includes(value as MessageSoundId)) {
    return value as MessageSoundId
  }
  return 'none'
}
