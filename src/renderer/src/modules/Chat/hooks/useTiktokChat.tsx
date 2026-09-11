import { useEffect, useRef, useState } from 'react'
import { getChatSystemTextWithParams } from '../../../shared/i18n'
import { limitMessages } from '../../../shared/utils/limitMessage'
import { useConfigStore } from '../../../shared/store/useConfigStore'
import type { ChatBadge } from '../../../shared/utils/chatBadges'

interface IEmojis {
  id: string
  posInit: number
  posEnd: number
}

type TikTokChatPayload = {
  username: string
  message: string
  channel: string
  timestamp: number
  badges?: ChatBadge[]
}

interface IChat {
  id?: string
  name?: string
  message: string
  color?: string
  emojis?: IEmojis[] | string
  timestamp?: number
  channelId?: string
  badges?: ChatBadge[]
}

export default function useTiktokChat() {
  const [tiktokChat, setTiktokChat] = useState<IChat[]>([])

  const { config } = useConfigStore()
  const botListRef = useRef<string[]>([])

  useEffect(() => {
    botListRef.current = config?.bots?.userBots ?? []
  }, [config?.bots?.userBots])

  useEffect(() => {
    const channel = config?.tiktok?.channel?.trim()
    const language = config?.language ?? 'pt-BR'

    if (!channel) {
      void window.api.disconnectTikTok()
      return
    }

    let active = true

    const appendTikTok = (incoming: IChat) => {
      setTiktokChat((data) => {
        if (incoming.id && data.some((item) => item.id === incoming.id)) return data
        if (
          data.some(
            (item) =>
              item.name === incoming.name &&
              item.message === incoming.message &&
              Math.abs((item.timestamp ?? 0) - (incoming.timestamp ?? 0)) < 1500
          )
        ) {
          return data
        }
        return limitMessages([...data, incoming])
      })
    }

    appendTikTok({
      id: `tiktok-connecting-${channel}`,
      name: 'TikTok',
      color: 'green',
      message: getChatSystemTextWithParams(language, 'connecting', {
        channel
      }),
      emojis: '',
      timestamp: Date.now()
    })

    const unsubscribeStatus = window.api.onTikTokStatus((payload) => {
      if (!active) return
      if (payload.status === 'connected') {
        appendTikTok({
          id: `tiktok-connected-${channel}`,
          name: 'TikTok',
          color: 'green',
          message: `Connected to roomId ${payload.roomId ?? '-'}`,
          emojis: '',
          timestamp: Date.now()
        })
      }

      if (payload.status === 'error') {
        appendTikTok({
          id: `tiktok-error-${channel}`,
          name: 'TikTok',
          color: 'red',
          message: payload.message || 'Failed to connect',
          emojis: '',
          timestamp: Date.now()
        })
      }
    })

    const unsubscribeChat = window.api.onTikTokChat((payload: TikTokChatPayload) => {
      if (!active) return
      const validator =
        !botListRef.current.includes(payload.username?.toLocaleLowerCase() ?? '') &&
        !payload.message.startsWith('!')

      if (!validator || !payload.message) return

      appendTikTok({
        id: `tiktok-${payload.timestamp}-${payload.username}-${payload.message.slice(0, 40)}`,
        name: payload.username,
        color: '#5ea1ff',
        message: payload.message,
        emojis: '',
        timestamp: payload.timestamp,
        badges: payload.badges
      })
    })

    void window.api.connectTikTok(channel)

    return () => {
      active = false
      unsubscribeStatus()
      unsubscribeChat()
      void window.api.disconnectTikTok()
    }
  }, [config?.tiktok?.channel])

  return {
    tiktokChat
  }
}
