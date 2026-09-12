import { create } from 'zustand'
import type { MessageSoundId } from '../constants/messageSounds'
import type { TtsVoiceId } from '../constants/ttsVoices'
import type { AppLanguageCode } from '../i18n'

export type TConfigDataProps = {
  kick: { slug: string; id?: number; user_id?: number }
  twitch: { channel: string }
  youtube: { channelName: string; channelId?: string }
  tiktok: { channel: string }
  platform: string
  x: number
  y: number
  width: number
  height: number
  font: {
    size: number
    weight: number
  }
  background: {
    text: string
    background: string
    opacity: number
  }
  obsAppearance: {
    font: {
      family: string
      size: number
      weight: number
    }
    pageBackground: {
      color: string
      opacity: number
    }
    messageBackground: {
      colors: Array<{ color: string; opacity: number }>
    }
  }
  bots: {
    userBots: string[]
    defaultTrue: boolean
    default: string[]
  }
  notifications: {
    messageSound: MessageSoundId
    /** Intensidade 0–100 (volume) */
    messageSoundVolume: number
    ttsEnabled: boolean
    ttsVolume: number
    ttsRate: number
    ttsReadAuthor: boolean
    ttsVoice: TtsVoiceId
  }
  messageVisibility: {
    systemAlwaysVisible: boolean
    systemHideAfterSeconds: number
    viewersAlwaysVisible: boolean
    viewersHideAfterSeconds: number
  }
  emotes: {
    seventv: boolean
    betterttv: boolean
  }
  media: {
    linkImages: boolean
  }
  appearance: {
    platformColorDot: boolean
  }
  language: AppLanguageCode
}

type HideWindowProps = {
  config: TConfigDataProps | null
  setConfig: (data: HideWindowProps['config']) => void
}

export const useConfigStore = create<HideWindowProps>((set) => ({
  config: null,
  setConfig: (data) => set({ config: data })
}))
