// Libs
import { cn } from '../../shared/lib'
import { useEffect, useRef, useState } from 'react'
// Components
import { Header } from './components/Header'
import useKickChat from './hooks/useKickChat'
import useYouTubeChat from './hooks/useYouTubeChat'
import { useModel } from './hooks/useModel'
// Assets
import twitchLogo from '../../shared/assets/twitch-logo.png'
import kickLogo from '../../shared/assets/kick-logo.webp'
import youtubeLogo from '../../shared/assets/youtube-logo.png'
import tiktokLogo from '../../shared/assets/tiktok-logo.png'
import { MAX_CHAT_MESSAGES } from '../../shared/utils/limitMessage'
import {
  isChatSystemNoticeMessage,
  playIncomingMessageNotification
} from '../../shared/utils/messageNotification'
import useTiktokChat from './hooks/useTiktokChat'

type AllChats = {
  id: string
  platform: 'twitch' | 'kick' | 'youtube' | 'tiktok'
  author: {
    name: string
    color: string
  }
  message: {
    text: string
  }
  timestamp: number
  channelId?: string
}[]

export const Chat = () => {
  const [allChats, setAllChats] = useState<AllChats>([])
  const messageSoundPrimedRef = useRef(false)
  const newestMessageFingerprintRef = useRef<string | null>(null)
  const { chat, channelAvatars, config, messagesEndRef, showWindow, processMessageHTML } =
    useModel()

  const { kickChat } = useKickChat()
  const { youtubeChat } = useYouTubeChat()
  const { tiktokChat } = useTiktokChat()

  // Função para obter o logo da plataforma
  const getPlatformLogo = (platform: string) => {
    switch (platform) {
      case 'twitch':
        return twitchLogo
      case 'kick':
        return kickLogo
      case 'youtube':
        return youtubeLogo
      case 'tiktok':
        return tiktokLogo
      default:
        return twitchLogo
    }
  }

  useEffect(() => {
    const allMessages = [
      ...chat.map((data, index) => ({
        ...data,
        id: `twitch-${index}`,
        platform: 'twitch' as const,
        author: {
          name: data.name,
          color: data.color ?? 'blue'
        },
        message: {
          text: data.message
        },
        timestamp: data.timestamp || Date.now(),
        channelId: data.channelId
      })),
      ...tiktokChat.map((data: any, index: number) => ({
        ...data,
        id: `tiktok-${index}`,
        platform: 'tiktok' as const,
        author: {
          name: data.name,
          color: data.color ?? 'blue'
        },
        message: {
          text: data.message
        },
        timestamp: data.timestamp || Date.now(),
        channelId: data.channelId
      })),
      ...kickChat.map((data: any, index: number) => ({
        ...data,
        id: `kick-${index}`,
        platform: 'kick' as const,
        author: {
          name: data.sender?.username || 'Kick User',
          color: data.sender.identity.color ?? '#00ff00'
        },
        message: {
          text: data.content || data.message || ''
        },
        timestamp: data.timestamp || Date.now()
      })),
      ...youtubeChat.map((data: any, index: number) => ({
        id: `youtube-${index}`,
        platform: 'youtube' as const,
        author: {
          name: data.author?.name || 'YouTube User',
          color: data.author?.color ?? '#ff0000'
        },
        message: {
          text: data.message?.text || data.content || ''
        },
        timestamp: data.timestamp || Date.now()
      }))
    ]

    // Ordenar mensagens por timestamp (mais antigas primeiro)
    const sortedMessages = allMessages
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-MAX_CHAT_MESSAGES)

    setAllChats(sortedMessages)
  }, [chat, tiktokChat, kickChat, youtubeChat])

  useEffect(() => {
    if (!config) return

    const sorted = [...allChats].sort((a, b) => a.timestamp - b.timestamp)
    const newest = sorted[sorted.length - 1]
    if (!newest) return

    const fingerprint = `${newest.timestamp}:${newest.platform}:${newest.author.name}:${newest.message.text.slice(0, 160)}`

    if (!messageSoundPrimedRef.current) {
      messageSoundPrimedRef.current = true
      newestMessageFingerprintRef.current = fingerprint
      return
    }

    if (fingerprint === newestMessageFingerprintRef.current) return
    newestMessageFingerprintRef.current = fingerprint

    if (isChatSystemNoticeMessage(newest)) return

    void playIncomingMessageNotification(config.notifications)
  }, [allChats, config])

  // Scroll automático para novas mensagens de todas as plataformas
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [allChats])

  return (
    <main
      className={cn(
        'relative w-screen h-screen flex flex-col overflow-hidden rounded-[8px] bg-gray-900/95 backdrop-blur-sm border border-gray-600',
        !showWindow && 'bg-transparent backdrop-blur-none border-transparent'
      )}
    >
      <Header />

      <div
        className={cn(
          'mt-8 overflow-y-auto overflow-x-hidden flex-1 scroll px-3 pb-3',
          !showWindow && 'scroll-none'
        )}
      >
        <div className="space-y-2">
          {allChats
            .sort((a, b) => a.timestamp - b.timestamp)
            .map((data, index) => (
              <div
                className={cn(
                  'flex gap-2 p-0 rounded-md transition-all duration-200 fade-in',
                  index % 2 === 0 && 'bg-gray-800/10',
                  !showWindow && 'bg-transparent'
                )}
                style={{
                  backgroundColor: config?.background?.background
                }}
                key={data.id}
              >
                {/* Logo da plataforma + avatar do canal em collab */}
                <span className="flex-shrink-0 mt-1 inline-flex items-center gap-1">
                  <img
                    src={getPlatformLogo(data.platform)}
                    alt={`${data.platform} logo`}
                    className="w-4 h-4 object-cover rounded-sm"
                  />
                  {data.channelId && channelAvatars[data.channelId] && (
                    <img
                      src={channelAvatars[data.channelId]}
                      alt={`Avatar do canal ${data.channelId}`}
                      className="w-5 h-5 object-cover rounded-full"
                    />
                  )}
                </span>

                <div className={cn('items-center min-w-0 inline ')}>
                  <span
                    className="text-outline text-nowrap inline mr-1"
                    style={{
                      color: data.author.color,
                      fontSize: `${config?.font?.size ?? 14}px`,
                      fontWeight: config?.font?.weight ?? 400
                    }}
                  >
                    {data.author.name}:
                  </span>

                  <div
                    className="text-white inline text-outline-two break-words mt-0.5 leading-relaxed"
                    style={{
                      fontSize: `${config?.font?.size ?? 14}px`,
                      fontWeight: config?.font?.weight ?? 400
                    }}
                    dangerouslySetInnerHTML={{
                      __html: processMessageHTML(data.message.text)
                    }}
                  />
                </div>
              </div>
            ))}
        </div>
        {/* Ref to keep scroll at the end */}
        <div ref={messagesEndRef} />
      </div>
    </main>
  )
}
