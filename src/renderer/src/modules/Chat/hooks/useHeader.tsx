import { useState } from 'react'
import { useShowWindowStore } from '../store/useShowWindowStore'

export default function useHeader() {
  const { showWindow, setShowWindow } = useShowWindowStore()
  const [fullScreen, setFullScreen] = useState(false)

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
    showWindow,
    fullScreen,
    setFullScreen,
    openConfigWindow,
    handleShowWindow
  }
}
