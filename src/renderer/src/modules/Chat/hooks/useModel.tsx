import { useEffect, useRef, useState } from 'react'
// TMI js
import tmi from 'tmi.js'
// Hooks
import { useShowWindowStore } from '../store/useShowWindowStore'
import { TConfigDataProps, useConfigStore } from '../../../shared/store/useConfigStore'
import { limitMessages } from '../../../shared/utils/limitMessage'
import { normalizeStoredConfig } from '../../../shared/utils/normalizeConfig'
import { fetchChannelAvatar, getCachedChannelAvatar } from '../../../shared/api/twitchChannelAvatar'
import {
  ensureChannelTwitchBadges,
  ensureGlobalTwitchBadges,
  twitchTagsToBadges
} from '../../../shared/api/twitchBadges'
import { getChatSystemText, getChatSystemTextWithParams } from '../../../shared/i18n'
import type { ChatBadge } from '../../../shared/utils/chatBadges'

interface IEmojis {
  id: string
  posInit: number
  posEnd: number
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

interface IFormatMessage {
  message: string
  emojis: IEmojis[]
}

const img = 'https://static-cdn.jtvnw.net/emoticons/v2/'

function appendUniqueChat(current: IChat[], incoming: IChat | IChat[]): IChat[] {
  const items = Array.isArray(incoming) ? incoming : [incoming]
  const next = [...current]

  for (const item of items) {
    const duplicatedById = item.id ? next.some((existing) => existing.id === item.id) : false
    const duplicatedByContent = next.some(
      (existing) =>
        existing.name === item.name &&
        existing.message === item.message &&
        Math.abs((existing.timestamp ?? 0) - (item.timestamp ?? 0)) < 1500
    )

    if (duplicatedById || duplicatedByContent) continue
    next.push(item)
  }

  return limitMessages(next)
}

export function useModel() {
  const [chat, setChat] = useState<IChat[]>([])
  const [channelAvatars, setChannelAvatars] = useState<Record<string, string>>({})
  const { showWindow } = useShowWindowStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { config, setConfig } = useConfigStore()

  const handleConfigUpdate = async (_event: any, newConfig: TConfigDataProps) => {
    const platform = await window.electron.ipcRenderer.invoke('get-system')
    setConfig(normalizeStoredConfig({ ...newConfig, platform }))
  }

  // function updateConfig(type: 'kick' | 'twitch', channel: string) {
  //   setConfig((prev) => ({ ...prev, [type]: { channel: channel } }))
  // }

  useEffect(() => {
    window.electron.ipcRenderer.on('config-updated', handleConfigUpdate)

    return () => {
      window.electron.ipcRenderer.removeListener('config-updated', handleConfigUpdate)
    }
  }, [])

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await window.electron.ipcRenderer.invoke('get-config')

        if (response && typeof response === 'object') {
          if (response.success) {
            setConfig(normalizeStoredConfig(response.data))
          } else {
            console.error('Erro ao carregar configurações no Chat:', response.error)
            setConfig(normalizeStoredConfig(response.data ?? null))
          }
        } else {
          // Se não retornou dados, usa os dados padrão
          setConfig(normalizeStoredConfig(null))
        }
      } catch (error) {
        console.error('Erro ao carregar configurações no Chat:', error)
        // Em caso de erro, usa os dados padrão
        setConfig(normalizeStoredConfig(null))
      }
    }

    fetchConfig()
  }, [])

  function getEmojis(string: string) {
    const emojis = string?.split('/')

    const arrEmojis = emojis?.map((emoji) => {
      const objEmoji = emoji.split(':')

      return {
        id: objEmoji[0],
        posInit: Number(objEmoji[1].split(',')[0].split('-')[0]),
        posEnd: Number(objEmoji[1].split(',')[0].split('-')[1])
      }
    })

    return arrEmojis
  }

  function formatMessage({ message, emojis }: IFormatMessage) {
    let replacedMessage = message

    for (const emoji of emojis) {
      const url1 = `${img}/${emoji.id}/animated/light/3.0`
      const url2 = `${img}/${emoji.id}/static/light/3.0`

      const emojiImg = ` <img style='display:inline; width:30px; height:30px;' src=${url1} onerror="this.onerror=null; this.src='${url2}'" alt=${emoji.id}/> `
      const emojiName = message.substring(emoji.posInit, emoji.posEnd + 1).split(' ')[0]
      // Escapa caracteres especiais da palavra para evitar erros na regex
      const escapedWord = emojiName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      // Cria uma regex sem \b para permitir encontrar caracteres especiais
      const regex = new RegExp(`${escapedWord}`, 'g')

      replacedMessage = replacedMessage.replace(regex, emojiImg)
    }

    return replacedMessage
  }

  function ensureChannelAvatar(channelId: string) {
    const cached = getCachedChannelAvatar(channelId)

    if (cached?.avatarUrl) {
      setChannelAvatars((prev) =>
        prev[channelId] ? prev : { ...prev, [channelId]: cached.avatarUrl }
      )
      return
    }

    fetchChannelAvatar(channelId).then((data) => {
      if (data?.avatarUrl) {
        setChannelAvatars((prev) => ({ ...prev, [channelId]: data.avatarUrl }))
      }
    })
  }

  useEffect(() => {
    const channel = config?.twitch.channel?.trim()
    if (!config || !channel) return

    let active = true
    const language = config.language

    setChat((data) =>
      appendUniqueChat(data, {
        id: `twitch-connecting-${channel}`,
        name: getChatSystemText(language, 'connectLabel'),
        color: 'green',
        message: getChatSystemTextWithParams(language, 'connecting', {
          channel
        }),
        emojis: '',
        timestamp: Date.now()
      })
    )

    const client = new tmi.Client({
      channels: [channel]
    })

    client
      .connect()
      .then(() => {
        if (!active) {
          client.removeAllListeners()
          void client.disconnect()
          return
        }
        setChat((data) =>
          appendUniqueChat(data, [
            {
              id: `twitch-connected-${channel}`,
              name: getChatSystemText(language, 'connectLabel'),
              color: 'green',
              message: getChatSystemTextWithParams(language, 'connected', {
                channel
              }),
              emojis: '',
              timestamp: Date.now()
            },
            {
              id: `twitch-help-${channel}`,
              name: getChatSystemText(language, 'helpLabel'),
              color: 'orange',
              message: getChatSystemText(language, 'overlayHelp'),
              emojis: '',
              timestamp: Date.now()
            }
          ])
        )
      })
      .catch((err) => {
        if (!active) return
        setChat((data) =>
          appendUniqueChat(data, {
            id: `twitch-error-${channel}`,
            name: getChatSystemText(language, 'connectLabel'),
            color: 'red',
            message: getChatSystemTextWithParams(language, 'channelNotFound', {
              channel
            }),
            emojis: '',
            timestamp: Date.now()
          })
        )
        console.error('Erro ao conectar:', err)
      })

    void ensureGlobalTwitchBadges()

    client.on('roomstate', (_channel, state) => {
      if (!active) return
      const roomId = state['room-id']
      if (roomId) void ensureChannelTwitchBadges(roomId)
    })

    client.on('message', (_, tags, message) => {
      if (!active) return

      const emojis = tags['emotes-raw'] && getEmojis(tags['emotes-raw'])
      const replaceMessage = emojis ? formatMessage({ message, emojis }) : message
      const channelId = tags['source-room-id']
      const badgeChannelId = tags['source-room-id'] || tags['room-id']
      const messageId = tags.id

      if (tags['room-id']) void ensureChannelTwitchBadges(tags['room-id'])
      if (channelId) void ensureChannelTwitchBadges(channelId)

      const validator =
        !config?.bots?.userBots?.includes(tags['display-name']?.toLocaleLowerCase() ?? '') &&
        !message.startsWith('!')

      if (validator) {
        if (channelId) {
          ensureChannelAvatar(channelId)
        }

        setChat((data) =>
          appendUniqueChat(data, {
            id: messageId,
            name: tags['display-name'],
            color: tags.color,
            message: replaceMessage,
            emojis: emojis,
            timestamp: Date.now(),
            channelId,
            badges: twitchTagsToBadges(tags.badges, badgeChannelId, tags['badges-raw'])
          })
        )
      }
    })

    return () => {
      active = false
      client.removeAllListeners()
      client.disconnect()
    }
  }, [config?.twitch.channel])

  function processMessageHTML(html: string): string {
    return html.replace(/<([^\s>]+)([^>]*)>/g, (match, tagName, attributes) => {
      if (tagName.toLowerCase() === 'img') {
        const srcMatch = attributes.match(/src=["']([^"']+)["']/)
        if (srcMatch) {
          try {
            const url = new URL(srcMatch[1])
            // Permitir imagens do Twitch, Kick e YouTube
            const allowedHostnames = ['static-cdn.jtvnw.net', 'files.kick.com', 'yt3.ggpht.com']
            return allowedHostnames.includes(url.hostname) ? match : '<img />'
          } catch {
            return '<img />'
          }
        }
        return '<img />'
      }
      return `&lt;${tagName}${attributes}&gt;`
    })
  }

  // Scroll automático para novas mensagens
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chat])

  return { chat, channelAvatars, messagesEndRef, showWindow, processMessageHTML, config }
}
