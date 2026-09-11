export const defaultConfigData = {
  language: 'pt-BR',
  notifications: {
    messageSound: 'none' as const,
    messageSoundVolume: 85
  },
  messageVisibility: {
    systemAlwaysVisible: true,
    systemHideAfterSeconds: 8,
    viewersAlwaysVisible: true,
    viewersHideAfterSeconds: 15
  },
  kick: { slug: '' },
  twitch: { channel: '' },
  youtube: { channelName: '' },
  font: {
    size: 16,
    weight: 700
  },
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
  x: 219,
  y: 122,
  width: 665,
  height: 601
}
