import { FormEvent, useEffect, useState } from 'react'
import { TConfigDataProps } from '../../../shared/store/useConfigStore'
import { normalizeStoredConfig } from '../../../shared/utils/normalizeConfig'

type ConfigKey = keyof Pick<
  TConfigDataProps,
  'kick' | 'twitch' | 'youtube' | 'tiktok' | 'font' | 'background' | 'bots' | 'notifications'
>

export function useModel() {
  const [config, setConfig] = useState<TConfigDataProps | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await window.electron.ipcRenderer.invoke('get-config')

        if (response?.success) {
          setConfig(normalizeStoredConfig(response.data))
        } else {
          setConfig(normalizeStoredConfig(response?.data ?? null))
          if (response?.error) setError(response.error)
        }
      } catch {
        setError('Erro ao carregar configurações')
        setConfig(normalizeStoredConfig(null))
      }
    }

    fetchConfig()
  }, [])

  function updateConfig<K extends ConfigKey>(key: K, value: Partial<TConfigDataProps[K]>) {
    setConfig((prev) => {
      if (!prev) return prev

      return {
        ...prev,
        [key]: { ...prev[key], ...value }
      }
    })
  }

  function setLanguage(language: TConfigDataProps['language']) {
    setConfig((prev) => (prev ? { ...prev, language } : prev))
  }

  async function handleUpdateConfig(event: FormEvent) {
    event.preventDefault()
    if (!config) return

    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const { platform: _platform, ...dataToSave } = config
      const response = await window.electron.ipcRenderer.invoke('save-config', dataToSave)

      if (response?.success) {
        setSuccessMessage(response.message ?? 'Configurações salvas com sucesso!')
      } else {
        setError(response?.error ?? 'Erro ao salvar configurações')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar configurações')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    error,
    config,
    isLoading,
    successMessage,
    setError,
    updateConfig,
    setLanguage,
    setSuccessMessage,
    handleUpdateConfig
  }
}
