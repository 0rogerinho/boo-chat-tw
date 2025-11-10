import { useState, useEffect } from 'react'
import { useShowWindowStore } from '../store/useShowWindowStore'
import { useConfigStore } from '../../../shared/store/useConfigStore'

export default function useHeader() {
  const { showWindow, setShowWindow } = useShowWindowStore()
  const { config } = useConfigStore()
  const [fullScreen, setFullScreen] = useState(false)
  const [platform, setPlatform] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlatform = async () => {
      try {
        const platformValue = await window.electron.ipcRenderer.invoke('get-system')
        setPlatform(platformValue)
      } catch (error) {
        console.error('Erro ao obter plataforma:', error)
        // Fallback para o config caso a chamada IPC falhe
        setPlatform(config?.platform || null)
      }
    }

    fetchPlatform()
  }, [config?.platform])

  function handleShowWindow() {
    setShowWindow(!showWindow)
    window.electron.ipcRenderer.send('alwaysOnTop', showWindow)
    window.electron.ipcRenderer.send('setIgnoreMouseEvents', showWindow)
  }

  window.electron.ipcRenderer.on('toggle-show-window', () => {
    handleShowWindow()
  })

  const openConfigWindow = () => {
    window.electron.ipcRenderer.send('open-config')
  }

  return {
    platform: platform || config?.platform,
    showWindow,
    fullScreen,
    setFullScreen,
    openConfigWindow,
    handleShowWindow
  }
}
