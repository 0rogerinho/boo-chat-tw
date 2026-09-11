import { useConfigStore } from '../../../shared/store/useConfigStore'
import { useEffect, useState } from 'react'
import Pusher from 'pusher-js'
import { getChatSystemTextWithParams } from '../../../shared/i18n'
import { isElectronRuntime } from '../../../shared/overlay/runtime'

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
      badges: string[]
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

    let pusher: Pusher | null = null

    const connectToKick = async () => {
      try {
        setKickChat((prev) => [
          ...prev,
          {
            id: 'Conexão-Kick',
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
          }
        ])
        // Obter informações do canal
        const channelResponse = isElectronRuntime
          ? await fetch(`https://kick.com/api/v1/channels/${config.kick.slug}`)
          : await fetch(`/api/kick/channels/${encodeURIComponent(config.kick.slug)}`)
        const channelPayload = await channelResponse.json()
        const channelData = isElectronRuntime ? channelPayload : channelPayload.data

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

        pusher.connection.bind('connected', () => {
          setKickChat((prev) => [
            ...prev,
            {
              id: 'Conexão-Kick',
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
                message_ref: 'Conexão-Kick'
              },
              timestamp: Date.now()
            }
          ])

          setIsConnected(true)
        })

        pusher.connection.bind('disconnected', () => {
          setIsConnected(false)
        })

        pusher.connection.bind('error', () => {
          setIsConnected(false)
        })

        // Subscrever ao canal
        const channel = pusher.subscribe(`chatrooms.${channelData.chatroom.id}.v2`)

        channel.bind('App\\Events\\ChatMessageEvent', (data) => {
          const originalContent = data.content || data.message || ''
          const processedContent = processKickEmojis(originalContent)

          const processedData = {
            ...data,
            content: processedContent,
            timestamp: Date.now()
          }
          setKickChat((prevData) => [...prevData, processedData])
        })
      } catch (error) {
        console.error('Erro ao conectar ao Kick:', error)
        setIsConnected(false)
      }
    }

    connectToKick()

    return () => {
      if (pusher) {
        pusher.disconnect()
      }
    }
  }, [config?.kick.slug])

  return { kickChat, isConnected }
}
