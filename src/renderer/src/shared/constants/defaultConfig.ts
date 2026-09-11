import type { MessageSoundId } from './messageSounds'

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
  width: 665,
  height: 601,
  background: {
    text: '#000000',
    background: '#ffffff',
    opacity: 30
  },
  obsAppearance: {
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
        { color: '#111827', opacity: 55 },
        { color: '#374151', opacity: 35 }
      ]
    }
  },
  bots: {
    userBots: [],
    defaultTrue: true,
    default: [
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
  },
  notifications: {
    messageSound: 'none' as MessageSoundId,
    messageSoundVolume: 85
  },
  messageVisibility: {
    systemAlwaysVisible: true,
    systemHideAfterSeconds: 8,
    viewersAlwaysVisible: true,
    viewersHideAfterSeconds: 15
  }
}
