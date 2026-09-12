import { useConfigStore } from '../../../shared/store/useConfigStore'
import { useEffect, useState, useRef } from 'react'
import YouTubeScraperService from '../../../shared/api/youtubeScraper'
import { getChatSystemTextWithParams } from '../../../shared/i18n'
import type { ChatBadge } from '../../../shared/utils/chatBadges'
import { safeChatImageHtml } from '../../../shared/utils/chatHtml'

interface ChatMessage {
  id: string
  author: {
    name: string
    color: string
    badges?: ChatBadge[]
  }
  message: {
    text: string
  }
  timestamp: number
}

// const bots = ['StreamElements', 'Usuário']

export default function useYouTubeChat() {
  const [youtubeChat, setYoutubeChat] = useState<ChatMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { config } = useConfigStore()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const activeRef = useRef(false)
  // Configuração do intervalo de polling (em ms)
  const POLLING_INTERVAL = 1500 // 1.5 segundos para melhor responsividade

  // Função para processar emojis do YouTube
  const processYouTubeEmojis = (message: string): string => {
    // Regex para encontrar emojis no formato [emoji:ID:nome] ou outros formatos do YouTube
    const emojiRegex = /\[emoji:(\d+):([^\]]+)\]/g

    return message.replace(emojiRegex, (_, emojiId, emojiName) => {
      return safeChatImageHtml(`https://yt3.ggpht.com/${emojiId}`, 'emote', {
        alt: String(emojiName ?? ''),
        title: String(emojiName ?? ''),
        style: 'display:inline;width:24px;height:24px;vertical-align:middle;margin:0 2px'
      })
    })
  }

  // Função para conectar via scraping (método gratuito)
  const connectViaScraping = async (channelName: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)

      const scraper = new YouTubeScraperService()
      const liveInfo = await scraper.resolveLiveChatInfo(channelName)

      if (!liveInfo) {
        throw new Error('Canal/URL não encontrado ou sem live ativa no momento.')
      }

      if (!activeRef.current) return false

      // Iniciar polling das mensagens via scraping
      startScrapingPolling(scraper, liveInfo.chatId)

      return true
    } catch (error) {
      console.error('Erro ao conectar via scraping:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
      setIsLoading(false)
      return false
    }
  }

  // Função para iniciar o polling via scraping
  const startScrapingPolling = (scraper: YouTubeScraperService, initialChatId: string) => {
    if (!activeRef.current) return
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    let currentChatId = initialChatId

    const pollMessages = async () => {
      if (!activeRef.current) return
      try {
        const { messages, continuation, error: pollingError } =
          await scraper.getLiveChatMessages(currentChatId)

        if (pollingError) {
          setError(pollingError)
        }

        if (continuation) {
          currentChatId = continuation
        }

        if (messages.length > 0) {
          setYoutubeChat((prevChat) => {
            // Filtrar mensagens duplicadas usando o estado atual
            const incoming = messages.map((item) => ({
              ...item,
              message: {
                ...item.message,
                text: processYouTubeEmojis(item.message.text)
              }
            }))
            const newMessages = incoming.filter(
              (data) =>
                !prevChat.some(
                  (msg) =>
                    msg.author.name === data.author.name && msg.message.text === data.message.text
                )
            )

            if (newMessages.length > 0) {
              return [...prevChat, ...newMessages]
            }

            return prevChat
          })
        }

        setIsLoading(false)
        setIsConnected(true)
        setError(null)
      } catch (error) {
        console.error('Erro ao obter mensagens via scraping:', error)
        setError('Erro ao obter mensagens do chat')
        setIsConnected(false)
      }
    }

    // Fazer polling com intervalo configurável para melhor responsividade
    intervalRef.current = setInterval(pollMessages, POLLING_INTERVAL)

    // Buscar mensagens iniciais imediatamente
    pollMessages()
  }

  // Função para limpar recursos
  const cleanup = () => {
    activeRef.current = false
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsConnected(false)
    setIsLoading(false)
  }

  useEffect(() => {
    if (!config?.youtube?.channelName) {
      cleanup()
      return
    }

    // Limpar estado anterior
    // setYoutubeChat([])
    setError(null)
    cleanup()
    activeRef.current = true

    const connectToYouTube = async () => {
      try {
        setYoutubeChat((prev) => {
          const incoming = {
            id: `youtube-connecting-${config.youtube.channelName}`,
            author: {
              name: 'YouTube-connect',
              color: '#ff0000'
            },
            message: {
              text: getChatSystemTextWithParams(config.language, 'connecting', {
                channel: config.youtube.channelName
              })
            },
            timestamp: Date.now()
          }
          if (prev.some((item) => item.id === incoming.id)) return prev
          return [...prev, incoming]
        })

        // Usar apenas scraping (método gratuito)
        const scrapingSuccess = await connectViaScraping(config.youtube.channelName)

        if (!activeRef.current) return

        if (scrapingSuccess) {
          setYoutubeChat((prev) => {
            const incoming = {
              id: `youtube-connected-${config.youtube.channelName}`,
              author: {
                name: 'YouTube-connect',
                color: '#ff0000'
              },
              message: {
                text: getChatSystemTextWithParams(config.language, 'connected', {
                  channel: config.youtube.channelName
                })
              },
              timestamp: Date.now()
            }
            if (prev.some((item) => item.id === incoming.id)) return prev
            return [...prev, incoming]
          })
        } else {
          setYoutubeChat((prev) => [
            ...prev,
            {
              id: `Conexão-YouTube-${Date.now()}`,
              author: {
                name: 'YouTube-connect',
                color: '#ff0000'
              },
              message: {
                text: getChatSystemTextWithParams(config.language, 'channelNotFound', {
                  channel: config.youtube.channelName
                })
              },
              timestamp: Date.now()
            }
          ])
          setIsConnected(false)
        }
      } catch (error) {
        setYoutubeChat((prev) => [
          ...prev,
          {
            id: `Conexão-YouTube-${Date.now()}`,
            author: {
              name: 'YouTube-connect',
              color: '#ff0000'
            },
            message: {
              text: getChatSystemTextWithParams(config.language, 'channelNotFound', {
                channel: config.youtube.channelName
              })
            },
            timestamp: Date.now()
          }
        ])

        console.error('Erro ao conectar ao YouTube:', error)
        setError('Erro ao conectar ao YouTube')
        setIsConnected(false)
      }
    }

    connectToYouTube()

    return cleanup
  }, [config?.youtube?.channelName])

  // Cleanup ao desmontar
  useEffect(() => {
    return cleanup
  }, [])

  return {
    youtubeChat,
    isConnected,
    error,
    isLoading,
    processYouTubeEmojis
  }
}
