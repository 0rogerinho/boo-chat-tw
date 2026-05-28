import { useCallback, useState } from 'react'
import Header from './components/Header'
import Button from '../../shared/components/Button'
import { ErrorNotification, SuccessNotification } from '../../shared/components/ErrorNotification'

import {
  MESSAGE_SOUND_IDS,
  getMessageSoundLabels,
  parseMessageSound
} from '../../shared/constants/messageSounds'
import { playIncomingMessageNotification } from '../../shared/utils/messageNotification'
import { APP_LANGUAGE_OPTIONS, getConfigI18n, normalizeLanguage } from '../../shared/i18n'
import { useModel } from './hooks/useModel'

function parseBotDraft(value: string): string[] {
  return value
    .split(/[\s,]+/)
    .map((b) => b.trim().toLowerCase())
    .filter((b) => b.length > 0)
}

export const Config = () => {
  const {
    error,
    config,
    isLoading,
    successMessage,
    setError,
    updateConfig,
    setLanguage,
    setSuccessMessage,
    handleUpdateConfig
  } = useModel()

  const [botDraft, setBotDraft] = useState('')
  const language = normalizeLanguage(config?.language)
  const i18n = getConfigI18n(language)
  const soundLabels = getMessageSoundLabels(language)

  const commitBotDraft = useCallback(() => {
    const parsed = parseBotDraft(botDraft)
    if (parsed.length === 0) return
    const existing = config?.bots?.userBots ?? []
    const merged = [...new Set([...existing.map((b) => b.toLowerCase()), ...parsed])]
    updateConfig('bots', { userBots: merged })
    setBotDraft('')
  }, [botDraft, config?.bots?.userBots, updateConfig])

  const removeBotTag = useCallback(
    (index: number) => {
      const bots = [...(config?.bots?.userBots ?? [])]
      bots.splice(index, 1)
      updateConfig('bots', { userBots: bots })
    },
    [config?.bots?.userBots, updateConfig]
  )

  return (
    <div className="flex flex-col w-screen h-screen rounded-[8px] overflow-hidden bg-gray-900 backdrop-blur-sm border border-gray-600 ">
      <Header />

      {/* Notificações */}
      <ErrorNotification error={error} onClose={() => setError(null)} />
      <SuccessNotification message={successMessage} onClose={() => setSuccessMessage(null)} />

      <form
        action=""
        className="flex flex-col overflow-y-auto gap-6 px-6 py-6 scroll"
        onSubmit={handleUpdateConfig}
      >
        {/* Language */}
        <div className="space-y-2">
          <label className="text-white font-medium text-sm" htmlFor="language">
            {i18n.languageLabel}
          </label>
          <select
            id="language"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            value={language}
            onChange={({ target }) => setLanguage(normalizeLanguage(target.value))}
          >
            {APP_LANGUAGE_OPTIONS.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-white/80 text-xs">{i18n.languageHelp}</p>
        </div>

        {/* Twitch Channel */}
        <div className="space-y-2">
          <label className="text-white font-medium text-sm" htmlFor="channel">
            {i18n.twitchChannelLabel}
          </label>
          <input
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            id="channel"
            type="text"
            value={config?.twitch.channel ?? ''}
            placeholder={i18n.channelPlaceholder}
            onChange={({ target }) => updateConfig('twitch', { channel: target.value })}
          />
        </div>

        {/* Kick Channel */}
        <div className="space-y-2">
          <label className="text-white font-medium text-sm" htmlFor="kick-channel">
            {i18n.kickChannelLabel}
          </label>
          <input
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            id="kick-channel"
            type="text"
            value={config?.kick.slug ?? ''}
            placeholder={i18n.channelPlaceholder}
            onChange={({ target }) => updateConfig('kick', { slug: target.value })}
          />
        </div>

        {/* YouTube Channel */}
        <div className="space-y-2">
          <label className="text-white font-medium text-sm" htmlFor="youtube-channel">
            {i18n.youtubeChannelLabel}
          </label>
          <input
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            id="youtube-channel"
            type="text"
            value={config?.youtube?.channelName ?? ''}
            placeholder={i18n.youtubePlaceholder}
            onChange={({ target }) =>
              updateConfig('youtube', {
                channelName: target.value
              })
            }
          />
        </div>

        {/* TikTok Channel */}
        <div className="space-y-2">
          <label className="text-white font-medium text-sm" htmlFor="youtube-channel">
            {i18n.tiktokChannelLabel}
          </label>
          <input
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            id="tiktok-channel"
            type="text"
            value={config?.tiktok?.channel ?? ''}
            placeholder={i18n.tiktokPlaceholder}
            onChange={({ target }) =>
              updateConfig('tiktok', {
                channel: target.value
              })
            }
          />
        </div>

        {/* Font Settings */}
        <div className="space-y-4">
          <h3 className="text-white font-medium text-lg">{i18n.fontTitle}</h3>

          {/* Font Size */}
          <div className="flex flex-col space-y-2">
            <label className="text-white font-medium text-sm" htmlFor="font-size">
              {i18n.fontSizeLabel}: {config?.font?.size ?? 14}px
            </label>
            <input
              className=" h-2 bg-red-700 rounded-lg appearance-none cursor-pointer slider"
              id="font-size"
              type="range"
              min="10"
              max="24"
              value={config?.font?.size ?? 14}
              onChange={({ target }) =>
                updateConfig('font', {
                  ...config?.font,
                  size: parseInt(target.value)
                })
              }
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>10px</span>
              <span>24px</span>
            </div>
          </div>

          {/* Font Weight */}
          <div className="space-y-2">
            <label className="text-white font-medium text-sm" htmlFor="font-weight">
              {i18n.fontWeightLabel}:{' '}
              {config?.font?.weight === 300
                ? i18n.fontWeights[300]
                : config?.font?.weight === 400
                  ? i18n.fontWeights[400]
                  : config?.font?.weight === 500
                    ? i18n.fontWeights[500]
                    : config?.font?.weight === 600
                      ? i18n.fontWeights[600]
                      : config?.font?.weight === 700
                        ? i18n.fontWeights[700]
                        : i18n.fontWeights[400]}
            </label>
            <select
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              id="font-weight"
              value={config?.font?.weight ?? 400}
              onChange={({ target }) =>
                updateConfig('font', {
                  ...config?.font,
                  weight: parseInt(target.value)
                })
              }
            >
              <option value={300}>{i18n.fontWeights[300]} (300)</option>
              <option value={400}>{i18n.fontWeights[400]} (400)</option>
              <option value={500}>{i18n.fontWeights[500]} (500)</option>
              <option value={600}>{i18n.fontWeights[600]} (600)</option>
              <option value={700}>{i18n.fontWeights[700]} (700)</option>
            </select>
          </div>
        </div>

        <hr className="border-gray-700" />

        {/* Background Settings */}
        <div className="space-y-4">
          <div>
            <h3 className="text-white font-medium text-lg">{i18n.bgTitle}</h3>

            <p className="text-white/80 text-xs">{i18n.bgDescription}</p>
          </div>

          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={config?.background?.background ?? ''}
              className="w-12 h-10 rounded-md"
              onChange={({ target }) => updateConfig('background', { background: target.value })}
            />
            <input
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              id="channel"
              type="text"
              value={config?.background?.background ?? ''}
              placeholder={i18n.bgPlaceholder}
              onChange={({ target }) => updateConfig('background', { background: target.value })}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-white font-medium text-sm" htmlFor="bg-opacity">
              {i18n.bgOpacityLabel}: {config?.background?.opacity ?? 30}%
            </label>
            <input
              className="h-2 bg-red-700 rounded-lg appearance-none cursor-pointer slider"
              id="bg-opacity"
              type="range"
              min={0}
              max={100}
              value={config?.background?.opacity ?? 30}
              onChange={({ target }) =>
                updateConfig('background', {
                  ...config?.background,
                  opacity: parseInt(target.value, 10)
                })
              }
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>{i18n.mutedLabel}</span>
              <span>{i18n.maxLabel}</span>
            </div>
          </div>
        </div>

        <hr className="border-gray-700" />

        <div className="space-y-4">
          <div>
            <h3 className="text-white font-medium text-lg">{i18n.soundTitle}</h3>

            <p className="text-white/80 text-xs">{i18n.soundDescription}</p>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-white font-medium text-sm" htmlFor="message-sound-volume">
              {i18n.soundVolumeLabel}: {config?.notifications?.messageSoundVolume ?? 85}%
            </label>
            <input
              id="message-sound-volume"
              type="range"
              min={0}
              max={100}
              className="h-2 bg-red-700 rounded-lg appearance-none cursor-pointer slider"
              value={config?.notifications?.messageSoundVolume ?? 85}
              onChange={({ target }) =>
                updateConfig('notifications', {
                  ...config?.notifications,
                  messageSoundVolume: parseInt(target.value, 10)
                })
              }
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>{i18n.mutedLabel}</span>
              <span>{i18n.maxLabel}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
            <label className="sr-only" htmlFor="message-sound">
              Som de nova mensagem
            </label>
            <select
              id="message-sound"
              className="w-full sm:flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              value={parseMessageSound(config?.notifications?.messageSound)}
              onChange={({ target }) =>
                updateConfig('notifications', {
                  ...config?.notifications,
                  messageSound: parseMessageSound(target.value)
                })
              }
            >
              {MESSAGE_SOUND_IDS.map((id) => (
                <option key={id} value={id}>
                  {soundLabels[id]}
                </option>
              ))}
            </select>
            <Button
              type="button"
              className="w-full sm:w-auto shrink-0"
              variant="secondary"
              onClick={() =>
                void playIncomingMessageNotification({
                  ...config?.notifications,
                  messageSound: parseMessageSound(config?.notifications?.messageSound),
                  messageSoundVolume: config?.notifications?.messageSoundVolume
                })
              }
            >
              {i18n.testSound}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-white font-medium text-lg">{i18n.ignoreBotsTitle}</h3>

            <p className="text-white/80 text-xs">
              {i18n.ignoreBotsDescription} Exemplo:{' '}
              <span className="text-primary-400">nightbot streamelements</span>
              <br />
              <br />
              {i18n.save}.
            </p>
          </div>

          <div
            id="ignore-bots"
            className="w-full min-h-[3rem] px-2 py-1.5 bg-gray-800 border border-gray-700 rounded flex flex-wrap gap-1.5 items-center focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent transition-all duration-200"
            role="group"
            aria-label={i18n.ignoreBotsAriaLabel}
          >
            {(config?.bots?.userBots ?? []).map((name, index) => (
              <span
                key={`${name}-${index}`}
                className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-md bg-gray-700 text-white text-sm border border-gray-600"
              >
                <span className="max-w-[200px] truncate" title={name}>
                  {name}
                </span>
                <button
                  type="button"
                  className="shrink-0 rounded p-0.5 text-gray-400 hover:text-white hover:bg-gray-600 transition-colors"
                  aria-label={`${i18n.removeBotAriaPrefix} ${name}`}
                  onClick={() => removeBotTag(index)}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              className="flex-1 min-w-[8rem] px-1 py-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm"
              type="text"
              placeholder={
                (config?.bots?.userBots?.length ?? 0) === 0
                  ? i18n.ignoreBotsPlaceholderEmpty
                  : i18n.ignoreBotsPlaceholderAdd
              }
              value={botDraft}
              onChange={({ target }) => setBotDraft(target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
                  e.preventDefault()
                  commitBotDraft()
                  return
                }
                if (
                  e.key === 'Backspace' &&
                  botDraft === '' &&
                  (config?.bots?.userBots?.length ?? 0) > 0
                ) {
                  e.preventDefault()
                  removeBotTag((config?.bots?.userBots?.length ?? 1) - 1)
                }
              }}
              onBlur={() => {
                if (parseBotDraft(botDraft).length > 0) commitBotDraft()
              }}
            />
          </div>
        </div>

        {/* Actions */}

        <div className="flex gap-2 items-center justify-end">
          <Button
            className="w-fit"
            variant="secondary"
            type="button"
            onClick={() => window.electron.ipcRenderer.send('close-config')}
          >
            {i18n.cancel}
          </Button>
          <Button className="w-fit" type="submit" disabled={isLoading}>
            {isLoading ? i18n.saving : i18n.save}
          </Button>
        </div>
      </form>
    </div>
  )
}
