import type { MessageSoundId } from './messageSounds'
import type { TtsVoiceId } from './ttsVoices'

const DEFAULT_IGNORED_BOTS = [
  '9kmmrbot',
  'blerp',
  'buttsbot',
  'creatisbot',
  'dr3ddbot',
  'kikettebot',
  'kofistreambot',
  'logiceftbot',
  'lolrankbot',
  'mikuia',
  'moobot',
  'mtgbot',
  'nightbot',
  'onsprintbot',
  'playwithviewersbot',
  'pokemoncommunitygame',
  'pretzelrocks',
  'restreambot',
  'sery_bot',
  'songlistbot',
  'soundalerts',
  'sport_scores_bot',
  'ssakdook',
  'streamelements',
  'streamholics',
  'streamlabs',
  'streamstickers',
  'vtuberplus',
  'wizebot',
  'wzbot'
]

export const DEFAULT_CONFIG_DATA = {
  language: 'pt-BR',
  platform: '',
  kick: { slug: '' },
  twitch: { channel: '' },
  youtube: { channelName: '' },
  tiktok: { channel: '' },
  font: {
    size: 16,
    weight: 700
  },
  x: 219,
  y: 122,
  width: 452,
  height: 411,
  background: {
    text: '#000000',
    background: '#000000',
    opacity: 0
  },
  obsAppearance: {
    font: {
      family: 'Open Sans',
      size: 16,
      weight: 700
    },
    pageBackground: {
      color: '#141414',
      opacity: 79
    },
    messageBackground: {
      colors: [
        { color: '#1f1f1f', opacity: 80 },
        { color: '#000000', opacity: 0 }
      ]
    }
  },
  liveAppearance: {
    font: {
      family: 'Open Sans',
      size: 16,
      weight: 700
    },
    pageBackground: {
      color: '#000000',
      opacity: 0
    },
    messageBackground: {
      colors: [
        { color: '#000000', opacity: 0 }
      ]
    }
  },
  bots: {
    userBots: [...DEFAULT_IGNORED_BOTS],
    defaultTrue: true,
    default: [...DEFAULT_IGNORED_BOTS]
  },
  notifications: {
    messageSound: 'none' as MessageSoundId,
    messageSoundVolume: 20,
    ttsEnabled: false,
    ttsVolume: 85,
    ttsRate: 1,
    ttsReadAuthor: true,
    ttsVoice: 'pt-BR-jeff' as TtsVoiceId
  },
  messageVisibility: {
    systemAlwaysVisible: true,
    systemHideAfterSeconds: 30,
    viewersAlwaysVisible: true,
    viewersHideAfterSeconds: 15
  },
  emotes: {
    seventv: true,
    betterttv: true
  },
  media: {
    linkImages: false
  },
  appearance: {
    platformColorDot: false
  }
}
