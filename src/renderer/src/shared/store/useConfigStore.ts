import { create } from 'zustand'

export type TConfigDataProps = {
  kick: { slug: string; id?: number; user_id?: number }
  twitch: { channel: string }
  youtube: { channelName: string; channelId?: string }
  x: number
  y: number
  width: number
  height: number
  font: {
    size: number
    weight: number
  }
}

type HideWindowProps = {
  config: TConfigDataProps | null
  setConfig: (data: HideWindowProps['config']) => void
}

export const useConfigStore = create<HideWindowProps>((set) => ({
  config: null,
  setConfig: (data) => set({ config: data })
}))
