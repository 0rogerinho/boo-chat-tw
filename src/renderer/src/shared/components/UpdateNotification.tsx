import React from 'react'
import { useAutoUpdater } from '../hooks/useAutoUpdater'

export const UpdateNotification: React.FC = () => {
  const {
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
  } = useAutoUpdater()

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <div className="flex justify-between items-center">
          <span>Erro: {error}</span>
          <button
            onClick={() => window.location.reload()}
            className="text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      </div>
    )
  }

  if (isUpdateDownloaded) {
    return (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-bold">Atualização baixada!</p>
            <p className="text-sm">
              A nova versão {updateInfo?.version} está pronta para instalação.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={installUpdate}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
            >
              Instalar Agora
            </button>
            <button
              onClick={() => window.location.reload()}
              className="text-green-500 hover:text-green-700"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isUpdateAvailable) {
    return (
      <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-bold">Nova versão disponível!</p>
            <p className="text-sm">
              Versão {updateInfo?.version} está disponível. Versão atual: {appVersion}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadUpdate}
              disabled={isDownloading}
              className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-1 px-3 rounded text-sm"
            >
              {isDownloading ? 'Baixando...' : 'Baixar'}
            </button>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-500 hover:text-blue-700"
            >
              ✕
            </button>
          </div>
        </div>
        {downloadProgress && (
          <div className="mt-2">
            <div className="bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${downloadProgress.percent}%` }}
              ></div>
            </div>
            <p className="text-xs mt-1">
              {downloadProgress.percent.toFixed(1)}% -{' '}
              {Math.round(downloadProgress.bytesPerSecond / 1024)} KB/s
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-gray-100 border border-gray-300 text-gray-600 px-4 py-2 rounded mb-4">
      <div className="flex justify-between items-center">
        <span className="text-sm">Versão {appVersion}</span>
        <button
          onClick={checkForUpdates}
          disabled={isChecking}
          className="text-blue-500 hover:text-blue-700 disabled:text-gray-400 text-sm"
        >
          {isChecking ? 'Verificando...' : 'Verificar atualizações'}
        </button>
      </div>
    </div>
  )
}
