// Libs
import { cn } from '../../shared/lib'
import { useEffect, useRef, useState } from 'react'
import { Header } from './components/Header'
import useKickChat from './hooks/useKickChat'
import useYouTubeChat from './hooks/useYouTubeChat'
import { useModel } from './hooks/useModel'
import twitchLogo from '../../shared/assets/twitch-logo.png'
import kickLogo from '../../shared/assets/kick-logo.webp'
import youtubeLogo from '../../shared/assets/youtube-logo.png'
import tiktokLogo from '../../shared/assets/tiktok-logo.png'
import { MAX_CHAT_MESSAGES } from '../../shared/utils/limitMessage'
import {
  isChatSystemNoticeMessage,
  playIncomingMessageNotification
} from '../../shared/utils/messageNotification'
import { cancelMessageTts, speakIncomingChatMessage } from '../../shared/utils/messageTts'
import { isChatMessageExpired } from '../../shared/utils/messageVisibility'
import useTiktokChat from './hooks/useTiktokChat'
import { isElectronRuntime, isLiveRoute, isObsOverlayRoute } from '../../shared/overlay/runtime'
import { getObsFontStack } from '../../shared/constants/obsFonts'
import { hexToRgba, safeCssColor } from '../../shared/utils/color'
import { hydrateChatImages, isSafeDisplayImageUrl } from '../../shared/utils/chatHtml'
import { DEFAULT_CONFIG_DATA } from '../../shared/constants/defaultConfig'
import type { ChatBadge } from '../../shared/utils/chatBadges'
import { AuthorBadges } from './components/AuthorBadges'
import { hydrateTwshotImages } from '../../shared/utils/twshotImages'

const PLATFORM_DOT_COLORS = {
  twitch: '#9146FF',
  kick: '#53FC18',
  youtube: '#FF0000',
  tiktok: '#FE2C55'
} as const

type AllChats = {
  id: string
  platform: 'twitch' | 'kick' | 'youtube' | 'tiktok'
  author: {
    name: string
    color: string
    badges?: ChatBadge[]
  }
  message: {
    text: string
  }
  timestamp: number
  channelId?: string
}[]

export const Chat = ({ overlay = false, live = false }: { overlay?: boolean; live?: boolean }) => {
  const isOverlay = overlay || isObsOverlayRoute()
  const isLiveView = live || isLiveRoute() || (!isElectronRuntime && !isOverlay)
  const [allChats, setAllChats] = useState<AllChats>([])
  const [now, setNow] = useState(() => Date.now())
  const messageSoundPrimedRef = useRef(false)
  const newestMessageFingerprintRef = useRef<string | null>(null)
  const chatListRef = useRef<HTMLDivElement>(null)
  const { chat, channelAvatars, config, messagesEndRef, showWindow, processMessageHTML } =
    useModel()

  const systemAlwaysVisible = config?.messageVisibility?.systemAlwaysVisible !== false
  const viewersAlwaysVisible = config?.messageVisibility?.viewersAlwaysVisible !== false
  const systemHideAfterSeconds = config?.messageVisibility?.systemHideAfterSeconds ?? 8
  const viewersHideAfterSeconds = config?.messageVisibility?.viewersHideAfterSeconds ?? 15
  const shouldTickVisibility = !systemAlwaysVisible || !viewersAlwaysVisible

  useEffect(() => {
    if (!shouldTickVisibility) return

    const intervalId = window.setInterval(() => {
      setNow(Date.now())
    }, 500)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [shouldTickVisibility])

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
        id: data.id || `twitch-${index}-${data.timestamp ?? 0}`,
        platform: 'twitch' as const,
        author: {
          name: data.name ?? '',
          color: data.color ?? 'blue',
          badges: data.badges
        },
        message: {
          text: data.message
        },
        timestamp: data.timestamp ?? 0,
        channelId: data.channelId
      })),
      ...tiktokChat.map((data, index) => ({
        id: data.id || `tiktok-${index}-${data.timestamp ?? 0}`,
        platform: 'tiktok' as const,
        author: {
          name: data.name ?? '',
          color: data.color ?? 'blue',
          badges: data.badges
        },
        message: {
          text: data.message
        },
        timestamp: data.timestamp ?? 0,
        channelId: data.channelId
      })),
      ...kickChat.map((data, index) => ({
        id: data.id || `kick-${index}-${data.timestamp}`,
        platform: 'kick' as const,
        author: {
          name: data.sender?.username || 'Kick User',
          color: data.sender.identity.color ?? '#00ff00',
          badges: data.sender?.identity?.badges
        },
        message: {
          text: data.content || ''
        },
        timestamp: data.timestamp,
        channelId: undefined
      })),
      ...youtubeChat.map((data, index) => ({
        id: data.id || `youtube-${index}-${data.timestamp}`,
        platform: 'youtube' as const,
        author: {
          name: data.author?.name || 'YouTube User',
          color: data.author?.color ?? '#ff0000',
          badges: data.author?.badges
        },
        message: {
          text: data.message?.text || ''
        },
        timestamp: data.timestamp,
        channelId: undefined
      }))
    ]

    const seenIds = new Set<string>()
    const seenContent = new Set<string>()
    const uniqueMessages = allMessages.filter((msg) => {
      if (seenIds.has(msg.id)) return false
      seenIds.add(msg.id)

      const contentKey = `${msg.platform}:${msg.channelId ?? ''}:${msg.author.name}:${msg.message.text}:${Math.round(msg.timestamp / 1500)}`
      if (seenContent.has(contentKey)) return false
      seenContent.add(contentKey)
      return true
    })

    const sortedMessages = uniqueMessages
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
    if (isOverlay) return

    void playIncomingMessageNotification(config.notifications)
    speakIncomingChatMessage({
      author: newest.author.name,
      message: newest.message.text,
      language: config.language,
      settings: config.notifications
    })
  }, [allChats, config, isOverlay])

  useEffect(() => {
    if (!config?.notifications?.ttsEnabled) cancelMessageTts()
  }, [config?.notifications?.ttsEnabled])

  // Scroll automático para novas mensagens de todas as plataformas
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [allChats])

  const electronOverlay = !showWindow && !isOverlay && !isLiveView

  const obsAppearance = config?.obsAppearance ?? DEFAULT_CONFIG_DATA.obsAppearance
  const liveAppearance = config?.liveAppearance ?? DEFAULT_CONFIG_DATA.liveAppearance
  const displayAppearance = isOverlay ? obsAppearance : isLiveView ? liveAppearance : null
  const overlayFontFamily = displayAppearance
    ? getObsFontStack(displayAppearance.font.family)
    : undefined
  const overlayFontSize = displayAppearance?.font.size ?? config?.font?.size ?? 14
  const overlayFontWeight = displayAppearance?.font.weight ?? config?.font?.weight ?? 400
  const platformIconSize = 16
  const usePlatformColorDot = config?.appearance?.platformColorDot === true
  const overlayPageBackground = displayAppearance
    ? hexToRgba(displayAppearance.pageBackground.color, displayAppearance.pageBackground.opacity)
    : undefined
  const isTransparentPage = isOverlay || isLiveView

  useEffect(() => {
    document.documentElement.classList.toggle('obs-overlay', isTransparentPage)
    document.body.classList.toggle('obs-overlay', isTransparentPage)

    return () => {
      document.documentElement.classList.remove('obs-overlay')
      document.body.classList.remove('obs-overlay')
    }
  }, [isTransparentPage])

  useEffect(() => {
    if (!isTransparentPage) return

    const pageColor = overlayPageBackground ?? 'transparent'
    const targets = [document.documentElement, document.body, document.getElementById('root')]
    targets.forEach((element) => {
      if (element) element.style.background = pageColor
    })

    return () => {
      targets.forEach((element) => {
        if (element) element.style.background = ''
      })
    }
  }, [isTransparentPage, overlayPageBackground])

  useEffect(() => {
    hydrateChatImages(chatListRef.current)
    if (config?.media?.linkImages === true) {
      hydrateTwshotImages(chatListRef.current)
    }
  }, [allChats, config?.media?.linkImages])

  const visibleChats = allChats.filter((data) => {
    const isSystem = isChatSystemNoticeMessage(data)
    return !isChatMessageExpired(
      data.timestamp,
      isSystem ? systemAlwaysVisible : viewersAlwaysVisible,
      isSystem ? systemHideAfterSeconds : viewersHideAfterSeconds,
      now
    )
  })

  return (
    <main
      className={cn(
        'relative w-screen h-screen flex flex-col overflow-hidden rounded-[8px] bg-gray-900/95 backdrop-blur-sm border border-gray-600',
        electronOverlay && 'bg-transparent backdrop-blur-none border-transparent',
        isOverlay && 'rounded-none border-transparent backdrop-blur-none bg-transparent',
        isLiveView && 'rounded-none border-transparent backdrop-blur-none bg-transparent'
      )}
      style={
        displayAppearance
          ? {
              backgroundColor: overlayPageBackground ?? 'transparent',
              fontFamily: overlayFontFamily
            }
          : undefined
      }
    >
      {!isOverlay && !isLiveView && <Header />}

      <div
        className={cn(
          'overflow-y-auto overflow-x-hidden flex-1 scroll',
          displayAppearance ? 'mt-0' : 'mt-8 px-3 pb-3',
          electronOverlay && 'scroll-none'
        )}
      >
        <div ref={chatListRef} className={cn(displayAppearance ? 'space-y-0' : 'space-y-2')}>
          {visibleChats
            .sort((a, b) => a.timestamp - b.timestamp)
            .map((data, index) => {
              const overlayLayer = displayAppearance
                ? displayAppearance.messageBackground.colors[
                    index % displayAppearance.messageBackground.colors.length
                  ]
                : undefined

              return (
                <div
                  className={cn(
                    'flex gap-2 transition-all duration-200 fade-in',
                    displayAppearance ? 'w-full rounded-none px-3 py-1' : 'p-0 rounded-md',
                    !displayAppearance && index % 2 === 0 && 'bg-gray-800/10',
                    electronOverlay && 'bg-transparent'
                  )}
                  style={{
                    backgroundColor: displayAppearance
                      ? hexToRgba(overlayLayer?.color, overlayLayer?.opacity ?? 55)
                      : hexToRgba(
                          config?.background?.background,
                          config?.background?.opacity ?? 100
                        )
                  }}
                  key={data.id}
                >
                  <div className={cn('items-center min-w-0 inline ')}>
                    <span
                      className="text-outline inline-flex flex-wrap items-center gap-0.5 mr-1"
                      style={{
                        color: safeCssColor(data.author.color, '#ffffff'),
                        fontSize: `${overlayFontSize}px`,
                        fontWeight: overlayFontWeight
                      }}
                    >
                      {usePlatformColorDot ? (
                        <span
                          aria-hidden
                          className="shrink-0 inline-block rounded-full align-middle"
                          style={{
                            width: platformIconSize,
                            height: platformIconSize,
                            minWidth: platformIconSize,
                            minHeight: platformIconSize,
                            backgroundColor: PLATFORM_DOT_COLORS[data.platform]
                          }}
                        />
                      ) : (
                        <img
                          src={getPlatformLogo(data.platform)}
                          alt={`${data.platform} logo`}
                          className="shrink-0 object-cover inline-block align-middle rounded-sm"
                          style={{
                            width: platformIconSize,
                            height: platformIconSize,
                            minWidth: platformIconSize,
                            minHeight: platformIconSize
                          }}
                        />
                      )}
                      {data.channelId &&
                        channelAvatars[data.channelId] &&
                        isSafeDisplayImageUrl(channelAvatars[data.channelId]) && (
                        <img
                          src={channelAvatars[data.channelId]}
                          alt={`Avatar do canal ${data.channelId}`}
                          className="shrink-0 object-cover inline-block align-middle rounded-full"
                          style={{
                            width: platformIconSize,
                            height: platformIconSize,
                            minWidth: platformIconSize,
                            minHeight: platformIconSize
                          }}
                        />
                      )}
                      <AuthorBadges badges={data.author.badges} />
                      <span className="text-nowrap">{data.author.name}:</span>
                    </span>

                    <div
                      className="text-white inline text-outline-two break-words mt-0.5 leading-relaxed"
                      style={{
                        fontSize: `${overlayFontSize}px`,
                        fontWeight: overlayFontWeight
                      }}
                      dangerouslySetInnerHTML={{
                        __html: processMessageHTML(data.message.text)
                      }}
                    />
                  </div>
                </div>
              )
            })}
        </div>
        {/* Ref to keep scroll at the end */}
        <div ref={messagesEndRef} />
      </div>
    </main>
  )
}
