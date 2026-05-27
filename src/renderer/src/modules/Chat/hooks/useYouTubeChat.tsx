import { useConfigStore } from '../../../shared/store/useConfigStore'
import { useEffect, useState, useRef } from 'react'
import YouTubeScraperService from '../../../shared/api/youtubeScraper'
import { getChatSystemTextWithParams } from '../../../shared/i18n'

interface ChatMessage {
  id: string
  author: {
    name: string
    color: string
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
  // Configuração do intervalo de polling (em ms)
  const POLLING_INTERVAL = 1500 // 1.5 segundos para melhor responsividade

  // Função para processar emojis do YouTube
  const processYouTubeEmojis = (message: string): string => {
    // Regex para encontrar emojis no formato [emoji:ID:nome] ou outros formatos do YouTube
    const emojiRegex = /\[emoji:(\d+):([^\]]+)\]/g

    return message.replace(emojiRegex, (_, emojiId, emojiName) => {
      const emojiUrl = `https://yt3.ggpht.com/${emojiId}`
      return `<img style="display:inline; width:24px; height:24px; vertical-align:middle; margin:0 2px;" src="${emojiUrl}" alt="${emojiName}" title="${emojiName}" />`
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
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    let currentChatId = initialChatId

    const pollMessages = async () => {
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
            const newMessages = messages.filter(
              (data) =>
                !prevChat.some(
                  (msg) =>
                    msg.author.name === data.author.name && msg.message.text === data.message.text
                )
            )

            if (newMessages.length > 0) {
              const updatedChat = [...prevChat, ...newMessages]
              return updatedChat
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

    const connectToYouTube = async () => {
      try {
        setYoutubeChat((prev) => [
          ...prev,
          {
            id: `Conexão-YouTube-${Date.now()}`,
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
        ])

        // Usar apenas scraping (método gratuito)
        const scrapingSuccess = await connectViaScraping(config.youtube.channelName)

        if (scrapingSuccess) {
          setYoutubeChat((prev) => [
            ...prev,
            {
              id: `Conexão-YouTube-${Date.now()}`,
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
          ])
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
