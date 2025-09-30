import React, { useState, useEffect } from 'react'
import { CheckCircle, Download, AlertCircle, X } from 'lucide-react'

interface UpdateInfo {
  version: string
  releaseNotes?: string
  releaseDate?: string
}

interface UpdateNotificationProps {
  onClose: () => void
}

export const UpdateNotification: React.FC<UpdateNotificationProps> = ({ onClose }) => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isUpdateDownloaded, setIsUpdateDownloaded] = useState(false)

  useEffect(() => {
    // Configurar listeners para eventos do updater
    const handleCheckingForUpdate = () => {
      setIsChecking(true)
      setError(null)
    }

    const handleUpdateAvailable = (info: UpdateInfo) => {
      setUpdateInfo(info)
      setIsChecking(false)
    }

    const handleUpdateNotAvailable = () => {
      setIsChecking(false)
      setError('Nenhuma atualização disponível')
    }

    const handleError = (errorMessage: string) => {
      setError(errorMessage)
      setIsChecking(false)
      setIsDownloading(false)
    }

    const handleDownloadProgress = (progress: any) => {
      setDownloadProgress(progress.percent)
    }

    const handleUpdateDownloaded = () => {
      setIsDownloading(false)
      setIsUpdateDownloaded(true)
    }

    // Registrar listeners
    window.api.onUpdaterCheckingForUpdate(handleCheckingForUpdate)
    window.api.onUpdaterUpdateAvailable(handleUpdateAvailable)
    window.api.onUpdaterUpdateNotAvailable(handleUpdateNotAvailable)
    window.api.onUpdaterError(handleError)
    window.api.onUpdaterDownloadProgress(handleDownloadProgress)
    window.api.onUpdaterUpdateDownloaded(handleUpdateDownloaded)

    // Cleanup
    return () => {
      window.api.removeAllUpdaterListeners()
    }
  }, [])

  const handleCheckForUpdates = async () => {
    try {
      setIsChecking(true)
      setError(null)
      const result = await window.api.checkForUpdates()
      if (!result.success) {
        setError(result.error || 'Erro ao verificar atualizações')
      }
    } catch (err) {
      setError('Erro ao verificar atualizações')
    }
  }

  const handleDownloadUpdate = async () => {
    try {
      setIsDownloading(true)
      setError(null)
      const result = await window.api.downloadUpdate()
      if (!result.success) {
        setError(result.error || 'Erro ao baixar atualização')
        setIsDownloading(false)
      }
    } catch (err) {
      setError('Erro ao baixar atualização')
      setIsDownloading(false)
    }
  }

  const handleInstallUpdate = async () => {
    try {
      await window.api.installUpdate()
    } catch (err) {
      setError('Erro ao instalar atualização')
    }
  }

  if (error && !updateInfo) {
    return (
      <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Erro de Atualização</span>
          </div>
          <button onClick={onClose} className="hover:bg-red-600 rounded p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="mt-2 text-sm">{error}</p>
        <button
          onClick={handleCheckForUpdates}
          className="mt-3 bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  if (isUpdateDownloaded) {
    return (
      <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Atualização Pronta</span>
          </div>
          <button onClick={onClose} className="hover:bg-green-600 rounded p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="mt-2 text-sm">A atualização foi baixada e está pronta para instalação.</p>
        <div className="mt-3 flex space-x-2">
          <button
            onClick={handleInstallUpdate}
            className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
          >
            Instalar Agora
          </button>
          <button
            onClick={onClose}
            className="bg-green-600/50 hover:bg-green-600 px-3 py-1 rounded text-sm"
          >
            Depois
          </button>
        </div>
      </div>
    )
  }

  if (updateInfo) {
    return (
      <div className="fixed top-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span className="font-medium">Atualização Disponível</span>
          </div>
          <button onClick={onClose} className="hover:bg-blue-600 rounded p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="mt-2 text-sm">Nova versão {updateInfo.version} está disponível!</p>
        {isDownloading && (
          <div className="mt-3">
            <div className="flex justify-between text-sm mb-1">
              <span>Baixando...</span>
              <span>{Math.round(downloadProgress)}%</span>
            </div>
            <div className="w-full bg-blue-600/30 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
          </div>
        )}
        {!isDownloading && (
          <div className="mt-3 flex space-x-2">
            <button
              onClick={handleDownloadUpdate}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
            >
              Baixar Agora
            </button>
            <button
              onClick={onClose}
              className="bg-blue-600/50 hover:bg-blue-600 px-3 py-1 rounded text-sm"
            >
              Depois
            </button>
          </div>
        )}
      </div>
    )
  }

  if (isChecking) {
    return (
      <div className="fixed top-4 right-4 bg-gray-500 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span className="text-sm">Verificando atualizações...</span>
        </div>
      </div>
    )
  }

  return null
}
