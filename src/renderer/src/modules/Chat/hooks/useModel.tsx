import { useEffect, useRef, useState } from 'react'
// TMI js
import tmi from 'tmi.js'
// Hooks
import { useShowWindowStore } from '../store/useShowWindowStore'
// Mocks
import { bots } from '../../../shared/utils'
import { configDataProps } from '../../Config'

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
}

interface IFormatMessage {
  message: string
  emojis: IEmojis[]
}

const img = 'https://static-cdn.jtvnw.net/emoticons/v2/'

export function useModel() {
  const [chat, setChat] = useState<IChat[]>([])
  const { showWindow } = useShowWindowStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [config, setConfig] = useState<configDataProps>({ channel: '' })

  const handleConfigUpdate = (_event: any, newConfig: configDataProps) => {
    setConfig(newConfig)
  }

  useEffect(() => {
    window.electron.ipcRenderer.on('config-updated', handleConfigUpdate)

    return () => {
      window.electron.ipcRenderer.removeListener('config-updated', handleConfigUpdate)
    }
  }, [])

  useEffect(() => {
    const fetchConfig = async () => {
      const data = await window.electron.ipcRenderer.invoke('get-config')
      if (!data || !data.channel) {
        console.log('Config inválida no build:', data)
        setConfig({ channel: '' }) // Define um valor padrão
      } else {
        setConfig(data)
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

  useEffect(() => {
    if (!config.channel) return

    setChat((data) => [
      ...data,
      {
        name: 'CONEXÃO',
        color: 'green',
        message: `...CONECTANDO`,
        emojis: ''
      }
    ])

    const client = new tmi.Client({
      channels: [config.channel]
    })

    client
      .connect()
      .then(() => {
        setChat((data) => [
          ...data,
          {
            name: 'CONEXÃO',
            color: 'green',
            message: `Conectado ao chat de "${config.channel}"`,
            emojis: ''
          }
        ])
      })
      .catch((err) => {
        setChat((data) => [
          ...data,
          {
            name: 'CONEXÃO',
            color: 'red',
            message: `O canal ${config.channel} não foi encontrado`,
            emojis: ''
          }
        ])
        console.log('Erro ao conectar:', err)
      })

    client.on('message', (_, tags, message) => {
      const emojis = tags['emotes-raw'] && getEmojis(tags['emotes-raw'])
      const replaceMessage = emojis ? formatMessage({ message, emojis }) : message

      const validator =
        !bots.includes(tags['display-name']?.toLocaleLowerCase() ?? '') && !message.startsWith('!')

      if (validator) {
        setChat((data) => [
          ...data,
          {
            name: tags['display-name'],
            color: tags.color,
            message: replaceMessage,
            emojis: emojis
          }
        ])
      }
    })

    return () => {
      client.disconnect()
    }
  }, [config.channel])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chat])

  function processMessageHTML(html: string): string {
    return html.replace(/<([^\s>]+)([^>]*)>/g, (match, tagName, attributes) => {
      if (tagName.toLowerCase() === 'img') {
        const srcMatch = attributes.match(/src=["']([^"']+)["']/)
        if (srcMatch) {
          try {
            const url = new URL(srcMatch[1])
            return url.hostname === 'static-cdn.jtvnw.net' ? match : '<img />'
          } catch {
            return '<img />'
          }
        }
        return '<img />'
      }
      return `&lt;${tagName}${attributes}&gt;`
    })
  }

  return { chat, messagesEndRef, showWindow, processMessageHTML }
}
