import { useEffect, useState } from 'react'

interface UpdateInfo {
  version: string
  releaseDate: string
  releaseNotes?: string
}

interface DownloadProgress {
  bytesPerSecond: number
  percent: number
  transferred: number
  total: number
}

export const useAutoUpdater = () => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)
  const [isUpdateDownloaded, setIsUpdateDownloaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [appVersion, setAppVersion] = useState<string>('')

  // Obter versão atual do app
  useEffect(() => {
    const getVersion = async () => {
      try {
        const version = await window.api.getAppVersion()
        setAppVersion(version)
      } catch (err) {
        console.error('Erro ao obter versão do app:', err)
      }
    }
    getVersion()
  }, [])

  // Escutar eventos do auto-updater
  useEffect(() => {
    const handleUpdateAvailable = (_event: any, info: UpdateInfo) => {
      setUpdateInfo(info)
      setIsUpdateAvailable(true)
      setIsChecking(false)
    }

    const handleDownloadProgress = (_event: any, progress: DownloadProgress) => {
      setDownloadProgress(progress)
      setIsDownloading(true)
    }

    const handleUpdateDownloaded = (_event: any, _info: UpdateInfo) => {
      setIsUpdateDownloaded(true)
      setIsDownloading(false)
      setDownloadProgress(null)
    }

    // Escutar eventos do main process
    window.electron.ipcRenderer.on('update-available', handleUpdateAvailable)
    window.electron.ipcRenderer.on('download-progress', handleDownloadProgress)
    window.electron.ipcRenderer.on('update-downloaded', handleUpdateDownloaded)

    return () => {
      window.electron.ipcRenderer.removeAllListeners('update-available')
      window.electron.ipcRenderer.removeAllListeners('download-progress')
      window.electron.ipcRenderer.removeAllListeners('update-downloaded')
    }
  }, [])

  const checkForUpdates = async () => {
    try {
      setIsChecking(true)
      setError(null)
      const result = await window.api.checkForUpdates()

      if (!result.success) {
        setError(result.error || 'Erro ao verificar atualizações')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsChecking(false)
    }
  }

  const downloadUpdate = async () => {
    try {
      setIsDownloading(true)
      setError(null)
      const result = await window.api.downloadUpdate()

      if (!result.success) {
        setError(result.error || 'Erro ao baixar atualização')
        setIsDownloading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setIsDownloading(false)
    }
  }

  const installUpdate = async () => {
    try {
      setError(null)
      const result = await window.api.installUpdate()

      if (!result.success) {
        setError(result.error || 'Erro ao instalar atualização')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    }
  }

  return {
    appVersion,
    updateInfo,
    downloadProgress,
    isChecking,
    isDownloading,
    isUpdateAvailable,
    isUpdateDownloaded,
    error,
    checkForUpdates,
    downloadUpdate,
    installUpdate
  }
}
