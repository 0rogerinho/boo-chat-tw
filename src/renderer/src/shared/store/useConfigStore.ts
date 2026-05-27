import { create } from 'zustand'
import type { MessageSoundId } from '../constants/messageSounds'
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
  bots: {
    userBots: string[]
    defaultTrue: boolean
    default: string[]
  }
  notifications: {
    messageSound: MessageSoundId
    /** Intensidade 0–100 (volume) */
    messageSoundVolume: number
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
