import { useConfigStore } from '../../../shared/store/useConfigStore'
import { useEffect, useRef, useState } from 'react'
import Pusher from 'pusher-js'
import { getChatSystemTextWithParams } from '../../../shared/i18n'
import { isElectronRuntime } from '../../../shared/overlay/runtime'
import { kickLevelBadgeImage } from '../../../shared/constants/kickBadgeImages'
import {
  extractKickSubscriberBadges,
  extractKickUserLevel,
  mapKickIdentity,
  type ChatBadge,
  type KickSubscriberBadge
} from '../../../shared/utils/chatBadges'

type TKickChat = {
  id: string
  content: string
  type: string
  created_at: string
  sender: {
    id: number
    username: string
    slug: string
    identity: {
      color: string
      badges: ChatBadge[]
    }
  }
  metadata: {
    message_ref: string
  }
  timestamp: number
}

export default function useKickChat() {
  const [kickChat, setKickChat] = useState<TKickChat[]>([])
  const [isConnected, setIsConnected] = useState(false)

  const { config } = useConfigStore()
  const subscriberBadgesRef = useRef<KickSubscriberBadge[]>([])

  // Função para processar emojis da Kick
  const processKickEmojis = (message: string): string => {
    const emojiRegex = /\[emote:(\d+):([^\]]+)\]/g

    return message.replace(emojiRegex, (_, emoteId, emoteName) => {
      const emojiUrl = `https://files.kick.com/emotes/${emoteId}/fullsize`
      return `<img style="display:inline; width:24px; height:24px; vertical-align:middle; margin:0 2px;" src="${emojiUrl}" alt="${emoteName}" title="${emoteName}" />`
    })
  }

  useEffect(() => {
    if (!config?.kick.slug) return

    let active = true
    let pusher: Pusher | null = null

    const appendKick = (incoming: TKickChat) => {
      setKickChat((prev) => {
        if (prev.some((item) => item.id === incoming.id)) return prev
        if (
          prev.some(
            (item) =>
              item.sender.username === incoming.sender.username &&
              item.content === incoming.content &&
              Math.abs(item.timestamp - incoming.timestamp) < 1500
          )
        ) {
          return prev
        }
        return [...prev, incoming]
      })
    }

    const connectToKick = async () => {
      try {
        subscriberBadgesRef.current = []
        appendKick({
          id: `kick-connecting-${config.kick.slug}`,
            content: getChatSystemTextWithParams(config.language, 'connecting', {
              channel: config.kick.slug
            }),
            type: 'message',
            created_at: '',
            sender: {
              id: 123123,
              username: 'Kick-connect',
              slug: '',
              identity: {
                color: '#52fb17',
                badges: []
              }
            },
            metadata: {
              message_ref: 'Conexão-Kick'
            },
          timestamp: Date.now()
        })
        const channelResponse = isElectronRuntime
          ? await fetch(`https://kick.com/api/v1/channels/${encodeURIComponent(config.kick.slug)}`)
          : await fetch(`/api/kick/channels/${encodeURIComponent(config.kick.slug)}`)
        const channelPayload = await channelResponse.json()
        if (!active) return
        const channelData = isElectronRuntime ? channelPayload : channelPayload.data
        subscriberBadgesRef.current = extractKickSubscriberBadges(channelData)

        if (!channelData?.chatroom?.id) {
          console.error('Canal não encontrado:', config.kick.slug)
          return
        }

        // Conectar ao Pusher com a chave que funciona
        pusher = new Pusher('32cbd69e4b950bf97679', {
          cluster: 'us2',
          forceTLS: true,
          enabledTransports: ['wss', 'ws']
        })

        if (!active) {
          pusher.disconnect()
          pusher = null
          return
        }

        pusher.connection.bind('connected', () => {
          if (!active) return
          appendKick({
            id: `kick-connected-${config.kick.slug}`,
            content: getChatSystemTextWithParams(config.language, 'connected', {
              channel: config.kick.slug
            }),
            type: 'message',
            created_at: '',
            sender: {
              id: 123123,
              username: 'Kick-connect',
              slug: '',
              identity: {
                color: '#52fb17',
                badges: []
              }
            },
            metadata: {
              message_ref: `kick-connected-${config.kick.slug}`
            },
            timestamp: Date.now()
          })

          setIsConnected(true)
        })

        pusher.connection.bind('disconnected', () => {
          setIsConnected(false)
        })

        pusher.connection.bind('error', () => {
          setIsConnected(false)
        })

        const channelName = `chatrooms.${channelData.chatroom.id}.v2`
        const channel = pusher.subscribe(channelName)

        if (!active) {
          pusher.unsubscribe(channelName)
          pusher.disconnect()
          pusher = null
          return
        }

        channel.bind('App\\Events\\ChatMessageEvent', (data) => {
          if (!active) return
          const originalContent = data.content || data.message || ''
          const processedContent = processKickEmojis(originalContent)
          const badges = mapKickIdentity(data.sender?.identity, subscriberBadgesRef.current)
          const userLevel = extractKickUserLevel(data)
          if (userLevel > 0 && !badges.some((badge) => badge.id.startsWith('level-'))) {
            badges.unshift({
              id: `level-${userLevel}`,
              title: `Level ${userLevel}`,
              imageUrl: kickLevelBadgeImage(userLevel),
              wide: true,
              sortOrder: 1
            })
          }

          appendKick({
            ...data,
            id: data.id || `kick-${Date.now()}-${data.sender?.username ?? 'user'}`,
            content: processedContent,
            sender: {
              ...data.sender,
              identity: {
                ...data.sender?.identity,
                badges
              }
            },
            timestamp: Date.now()
          })
        })
      } catch (error) {
        console.error('Erro ao conectar ao Kick:', error)
        setIsConnected(false)
      }
    }

    connectToKick()

    return () => {
      active = false
      if (pusher) {
        pusher.allChannels().forEach((subscribed) => {
          pusher?.unsubscribe(subscribed.name)
        })
        pusher.unbind_all()
        pusher.disconnect()
        pusher = null
      }
    }
  }, [config?.kick.slug])

  return { kickChat, isConnected }
}
