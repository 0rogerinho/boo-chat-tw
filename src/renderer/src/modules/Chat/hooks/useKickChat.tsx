import { useConfigStore } from '../../../shared/store/useConfigStore'
import { useEffect, useRef, useState } from 'react'
import Pusher from 'pusher-js'
import { getChatSystemTextWithParams } from '../../../shared/i18n'
import { kickLevelBadgeImage } from '../../../shared/constants/kickBadgeImages'
import {
  extractKickIds,
  fetchKickChannel,
  fetchKickPusherConfig,
  normalizeKickSlug,
  parseKickEventData
} from '../../../shared/api/kickChat'
import {
  extractKickSubscriberBadges,
  extractKickUserLevel,
  mapKickIdentity,
  type ChatBadge,
  type KickSubscriberBadge
} from '../../../shared/utils/chatBadges'
import { safeChatImageHtml } from '../../../shared/utils/chatHtml'

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

function processKickEmojis(message: string): string {
  const emojiRegex = /\[emote:(\d+):([^\]]+)\]/g

  return message.replace(emojiRegex, (_, emoteId, emoteName) => {
    return safeChatImageHtml(`https://files.kick.com/emotes/${emoteId}/fullsize`, 'emote', {
      alt: String(emoteName ?? ''),
      title: String(emoteName ?? ''),
      style: 'display:inline;width:24px;height:24px;vertical-align:middle;margin:0 2px'
    })
  })
}

function kickSystemMessage(
  id: string,
  content: string,
  messageRef: string
): TKickChat {
  return {
    id,
    content,
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
      message_ref: messageRef
    },
    timestamp: Date.now()
  }
}

function pusherErrorCode(error: unknown): number {
  const root = error && typeof error === 'object' ? (error as Record<string, any>) : null
  const code = Number(root?.error?.data?.code ?? root?.data?.code ?? root?.code)
  return Number.isFinite(code) ? code : 0
}

export default function useKickChat() {
  const [kickChat, setKickChat] = useState<TKickChat[]>([])
  const [isConnected, setIsConnected] = useState(false)

  const { config } = useConfigStore()
  const subscriberBadgesRef = useRef<KickSubscriberBadge[]>([])
  const slug = normalizeKickSlug(config?.kick.slug ?? '')

  useEffect(() => {
    if (!slug) return

    let active = true
    let pusher: Pusher | null = null
    let retryDelay = 1500
    let retryTimer: ReturnType<typeof setTimeout> | null = null

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

    const disconnectPusher = () => {
      if (!pusher) return
      try {
        pusher.allChannels().forEach((subscribed) => {
          pusher?.unsubscribe(subscribed.name)
        })
        pusher.unbind_all()
        pusher.disconnect()
      } catch {
        // ignore cleanup errors
      }
      pusher = null
    }

    const scheduleRetry = () => {
      if (!active || retryTimer) return
      retryTimer = setTimeout(() => {
        retryTimer = null
        void connectToKick()
      }, retryDelay)
      retryDelay = Math.min(15000, Math.floor(retryDelay * 1.7))
    }

    const connectToKick = async () => {
      disconnectPusher()
      if (!active) return

      try {
        subscriberBadgesRef.current = []
        appendKick(
          kickSystemMessage(
            `kick-connecting-${slug}`,
            getChatSystemTextWithParams(config?.language, 'connecting', { channel: slug }),
            'Conexão-Kick'
          )
        )

        const channelResult = await fetchKickChannel(slug)
        if (!active) return

        const channelData = channelResult.data
        const ids = extractKickIds(channelData) ?? extractKickIds(channelResult)
        subscriberBadgesRef.current = extractKickSubscriberBadges(channelData)

        if (!ids) {
          console.error('Canal Kick não encontrado:', slug, channelResult)
          appendKick(
            kickSystemMessage(
              `kick-not-found-${slug}`,
              getChatSystemTextWithParams(
                config?.language,
                channelResult.success === false ? 'connectionFailed' : 'channelNotFound',
                { channel: slug }
              ),
              `kick-not-found-${slug}`
            )
          )
          setIsConnected(false)
          scheduleRetry()
          return
        }

        const pusherConfig = await fetchKickPusherConfig(ids.channelId)
        if (!active) return

        pusher = new Pusher(pusherConfig.app_key, {
          cluster: pusherConfig.cluster,
          forceTLS: true,
          enabledTransports: ['wss', 'ws']
        })

        pusher.connection.bind('connected', () => {
          if (!active) return
          retryDelay = 1500
          appendKick(
            kickSystemMessage(
              `kick-connected-${slug}`,
              getChatSystemTextWithParams(config?.language, 'connected', { channel: slug }),
              `kick-connected-${slug}`
            )
          )
          setIsConnected(true)
        })

        pusher.connection.bind('disconnected', () => {
          setIsConnected(false)
        })

        pusher.connection.bind('error', (error) => {
          setIsConnected(false)
          const code = pusherErrorCode(error)
          if (code >= 4000 && code < 4100) {
            disconnectPusher()
            scheduleRetry()
          }
        })

        const channelName = `chatrooms.${ids.chatroomId}.v2`
        const channel = pusher.subscribe(channelName)

        if (!active) {
          disconnectPusher()
          return
        }

        channel.bind('App\\Events\\ChatMessageEvent', (raw) => {
          if (!active) return
          const data = parseKickEventData(raw)
          if (!data) return

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
            id: String(data.id || `kick-${Date.now()}-${data.sender?.username ?? 'user'}`),
            content: processedContent,
            type: String(data.type || 'message'),
            created_at: String(data.created_at || ''),
            sender: {
              id: Number(data.sender?.id) || 0,
              username: String(data.sender?.username || 'Kick User'),
              slug: String(data.sender?.slug || ''),
              identity: {
                color: String(data.sender?.identity?.color || '#00ff00'),
                badges
              }
            },
            metadata: {
              message_ref: String(data.metadata?.message_ref || data.id || '')
            },
            timestamp: Date.now()
          })
        })
      } catch (error) {
        console.error('Erro ao conectar ao Kick:', error)
        setIsConnected(false)
        appendKick(
          kickSystemMessage(
            `kick-error-${slug}`,
            getChatSystemTextWithParams(config?.language, 'connectionFailed', { channel: slug }),
            `kick-error-${slug}`
          )
        )
        scheduleRetry()
      }
    }

    void connectToKick()

    return () => {
      active = false
      if (retryTimer) {
        clearTimeout(retryTimer)
        retryTimer = null
      }
      disconnectPusher()
    }
  }, [slug, config?.language])

  return { kickChat, isConnected }
}
