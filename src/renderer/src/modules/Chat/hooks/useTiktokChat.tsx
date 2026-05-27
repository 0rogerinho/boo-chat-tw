import { useEffect, useRef, useState } from 'react'
import { getChatSystemTextWithParams } from '../../../shared/i18n'
import { limitMessages } from '../../../shared/utils/limitMessage'
import { useConfigStore } from '../../../shared/store/useConfigStore'

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
}

interface IChat {
  name?: string
  message: string
  color?: string
  emojis?: IEmojis[] | string
  timestamp?: number
  channelId?: string
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

    setTiktokChat((data) =>
      limitMessages([
        ...data,
        {
          name: 'TikTok',
          color: 'green',
          message: getChatSystemTextWithParams(language, 'connecting', {
            channel
          }),
          emojis: '',
          timestamp: Date.now()
        }
      ])
    )

    const unsubscribeStatus = window.api.onTikTokStatus((payload) => {
      if (payload.status === 'connected') {
        setTiktokChat((data) =>
          limitMessages([
            ...data,
            {
              name: 'TikTok',
              color: 'green',
              message: `Connected to roomId ${payload.roomId ?? '-'}`,
              emojis: '',
              timestamp: Date.now()
            }
          ])
        )
      }

      if (payload.status === 'error') {
        setTiktokChat((data) =>
          limitMessages([
            ...data,
            {
              name: 'TikTok',
              color: 'red',
              message: payload.message || 'Failed to connect',
              emojis: '',
              timestamp: Date.now()
            }
          ])
        )
      }
    })

    const unsubscribeChat = window.api.onTikTokChat((payload: TikTokChatPayload) => {
      const validator =
        !botListRef.current.includes(payload.username?.toLocaleLowerCase() ?? '') &&
        !payload.message.startsWith('!')

      if (!validator || !payload.message) return

      setTiktokChat((data) =>
        limitMessages([
          ...data,
          {
            name: payload.username,
            color: '#5ea1ff',
            message: payload.message,
            emojis: '',
            timestamp: payload.timestamp
          }
        ])
      )
    })

    void window.api.connectTikTok(channel)

    return () => {
      unsubscribeStatus()
      unsubscribeChat()
      void window.api.disconnectTikTok()
    }
  }, [config?.tiktok?.channel, config?.language])
  console.log('tiktokChat', tiktokChat)

  return {
    tiktokChat
  }
}
