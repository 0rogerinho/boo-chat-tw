import { useEffect, useRef, useState } from 'react'
// TMI js
import tmi from 'tmi.js'
// Hooks
import { useShowWindowStore } from '../store/useShowWindowStore'
import { TConfigDataProps, useConfigStore } from '../../../shared/store/useConfigStore'
import { limitMessages } from '../../../shared/utils/limitMessage'
import { normalizeStoredConfig } from '../../../shared/utils/normalizeConfig'
import { fetchChannelAvatar, getCachedChannelAvatar } from '../../../shared/api/twitchChannelAvatar'
import { getChatSystemText, getChatSystemTextWithParams } from '../../../shared/i18n'

interface IEmojis {
  id: string
  posInit: number
  posEnd: number
}

interface IChat {
  name?: string
  message: string
  color?: string
  emojis?: IEmojis[] | string
  timestamp?: number
  channelId?: string
}

interface IFormatMessage {
  message: string
  emojis: IEmojis[]
}

const img = 'https://static-cdn.jtvnw.net/emoticons/v2/'

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
    if (!config?.twitch.channel) return

    setChat((data) =>
      limitMessages([
        ...data,
        {
          name: getChatSystemText(config.language, 'connectLabel'),
          color: 'green',
          message: getChatSystemTextWithParams(config.language, 'connecting', {
            channel: config.twitch.channel
          }),
          emojis: '',
          timestamp: Date.now()
        }
      ])
    )

    const client = new tmi.Client({
      channels: [config.twitch.channel]
    })

    client
      .connect()
      .then(() => {
        setChat((data) =>
          limitMessages([
            ...data,
            {
              name: getChatSystemText(config.language, 'connectLabel'),
              color: 'green',
              message: getChatSystemTextWithParams(config.language, 'connected', {
                channel: config.twitch.channel
              }),
              emojis: '',
              timestamp: Date.now()
            },
            {
              name: getChatSystemText(config.language, 'helpLabel'),
              color: 'orange',
              message: getChatSystemText(config.language, 'overlayHelp'),
              emojis: '',
              timestamp: Date.now()
            }
          ])
        )
      })
      .catch((err) => {
        setChat((data) =>
          limitMessages([
            ...data,
            {
              name: getChatSystemText(config.language, 'connectLabel'),
              color: 'red',
              message: getChatSystemTextWithParams(config.language, 'channelNotFound', {
                channel: config.twitch.channel
              }),
              emojis: '',
              timestamp: Date.now()
            }
          ])
        )
        console.error('Erro ao conectar:', err)
      })

    client.on('message', (_, tags, message) => {
      const emojis = tags['emotes-raw'] && getEmojis(tags['emotes-raw'])
      const replaceMessage = emojis ? formatMessage({ message, emojis }) : message
      const channelId = tags['source-room-id']

      const validator =
        !config?.bots?.userBots?.includes(tags['display-name']?.toLocaleLowerCase() ?? '') &&
        !message.startsWith('!')

      if (validator) {
        if (channelId) {
          ensureChannelAvatar(channelId)
        }

        setChat((data) =>
          limitMessages([
            ...data,
            {
              name: tags['display-name'],
              color: tags.color,
              message: replaceMessage,
              emojis: emojis,
              timestamp: Date.now(),
              channelId
            }
          ])
        )
      }
    })

    return () => {
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
