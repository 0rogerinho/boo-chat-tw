import { useCallback, useEffect, useState } from 'react'
import Header from './components/Header'
import Sidebar, { type ConfigSection } from './components/Sidebar'
import { FieldLabel } from './components/FieldLabel'
import { SectionHeader } from './components/SectionHeader'
import { SoundSetting } from './components/SoundSetting'
import { VisibilitySetting } from './components/VisibilitySetting'
import { ObsAppearanceSetting } from './components/ObsAppearanceSetting'
import { DEFAULT_CONFIG_DATA } from '../../shared/constants/defaultConfig'
import Button from '../../shared/components/Button'
import { ErrorNotification, SuccessNotification } from '../../shared/components/ErrorNotification'

import { getMessageSoundLabels, parseMessageSound } from '../../shared/constants/messageSounds'
import { APP_LANGUAGE_OPTIONS, getConfigI18n, normalizeLanguage } from '../../shared/i18n'
import { useModel } from './hooks/useModel'
import { Info, MessagesSquare } from 'lucide-react'

function parseBotDraft(value: string): string[] {
  return value
    .split(/[\s,]+/)
    .map((b) => b.trim().toLowerCase())
    .filter((b) => b.length > 0)
}

function fontWeightName(weight: number | undefined, labels: Record<number, string>): string {
  return labels[weight ?? 400] ?? labels[400]
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

  const [section, setSection] = useState<ConfigSection>('channels')
  const [botDraft, setBotDraft] = useState('')
  const [localAppUrl, setLocalAppUrl] = useState('')
  const [overlayUrl, setOverlayUrl] = useState('')
  const [copiedField, setCopiedField] = useState<'app' | 'overlay' | null>(null)
  const language = normalizeLanguage(config?.language)
  const i18n = getConfigI18n(language)
  const soundLabels = getMessageSoundLabels(language)

  useEffect(() => {
    let cancelled = false

    const loadLocalUrls = async () => {
      for (let attempt = 0; attempt < 10; attempt++) {
        try {
          const response = await window.electron.ipcRenderer.invoke('get-overlay-url')
          if (response?.success && (response.appUrl || response.url)) {
            if (!cancelled) {
              setLocalAppUrl(response.appUrl || '')
              setOverlayUrl(response.url || '')
            }
            return
          }
        } catch (error) {
          console.error('Erro ao obter link local:', error)
        }

        await new Promise((resolve) => setTimeout(resolve, 300))
      }
    }

    void loadLocalUrls()

    return () => {
      cancelled = true
    }
  }, [])

  const copyUrl = async (url: string, field: 'app' | 'overlay') => {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setCopiedField(field)
      window.setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error('Erro ao copiar link local:', error)
    }
  }

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

  const inputClass =
    'w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200'

  return (
    <div className="flex flex-col w-screen h-screen rounded-[8px] overflow-hidden bg-gray-900 backdrop-blur-sm border border-gray-600">
      <Header />

      <ErrorNotification error={error} onClose={() => setError(null)} />
      <SuccessNotification message={successMessage} onClose={() => setSuccessMessage(null)} />

      <div className="flex flex-1 min-h-0">
        <Sidebar section={section} onSelect={setSection} i18n={i18n} />

        <form
          className="flex flex-1 min-w-0 flex-col"
          onSubmit={handleUpdateConfig}
        >
          <div className="flex-1 overflow-y-auto scroll px-6 py-5 space-y-6">
            {section === 'general' && (
              <div className="space-y-6">
                <SectionHeader title={i18n.sidebarGeneral} description={i18n.sidebarGeneralIntro} />

                <div className="space-y-2">
                  <FieldLabel
                    htmlFor="language"
                    help={i18n.languageHelp}
                    helpAriaLabel={i18n.helpAriaLabel}
                  >
                    {i18n.languageLabel}
                  </FieldLabel>
                  <select
                    id="language"
                    className={inputClass}
                    value={language}
                    onChange={({ target }) => setLanguage(normalizeLanguage(target.value))}
                  >
                    {APP_LANGUAGE_OPTIONS.map((option) => (
                      <option key={option.code} value={option.code}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <hr className="border-gray-700" />

                <SoundSetting
                  title={i18n.soundTitle}
                  help={i18n.soundDescription}
                  helpAriaLabel={i18n.helpAriaLabel}
                  volumeLabel={i18n.soundVolumeLabel}
                  volumeHelp={i18n.soundVolumeHelp}
                  mutedLabel={i18n.mutedLabel}
                  maxLabel={i18n.maxLabel}
                  testLabel={i18n.testSound}
                  volume={config?.notifications?.messageSoundVolume ?? 85}
                  sound={parseMessageSound(config?.notifications?.messageSound)}
                  soundLabels={soundLabels}
                  onVolumeChange={(messageSoundVolume) =>
                    updateConfig('notifications', {
                      ...config?.notifications,
                      messageSoundVolume
                    })
                  }
                  onSoundChange={(messageSound) =>
                    updateConfig('notifications', {
                      ...config?.notifications,
                      messageSound
                    })
                  }
                />

                <hr className="border-gray-700" />

                <div className="space-y-3">
                  <h4 className="text-white font-medium text-sm">{i18n.messageVisibilityTitle}</h4>

                  <VisibilitySetting
                    title={i18n.messageVisibilitySystemTitle}
                    help={i18n.messageVisibilitySystemHelp}
                    helpAriaLabel={i18n.helpAriaLabel}
                    icon={Info}
                    alwaysVisible={config?.messageVisibility?.systemAlwaysVisible !== false}
                    seconds={config?.messageVisibility?.systemHideAfterSeconds ?? 8}
                    alwaysLabel={i18n.messageVisibilityAlways}
                    timedLabel={i18n.messageVisibilityTimed}
                    hideAfterLabel={i18n.messageVisibilityHideAfter}
                    secondsLabel={i18n.messageVisibilitySeconds}
                    onAlwaysVisibleChange={(always) =>
                      updateConfig('messageVisibility', { systemAlwaysVisible: always })
                    }
                    onSecondsChange={(seconds) =>
                      updateConfig('messageVisibility', { systemHideAfterSeconds: seconds })
                    }
                  />

                  <VisibilitySetting
                    title={i18n.messageVisibilityViewersTitle}
                    help={i18n.messageVisibilityViewersHelp}
                    helpAriaLabel={i18n.helpAriaLabel}
                    icon={MessagesSquare}
                    alwaysVisible={config?.messageVisibility?.viewersAlwaysVisible !== false}
                    seconds={config?.messageVisibility?.viewersHideAfterSeconds ?? 15}
                    alwaysLabel={i18n.messageVisibilityAlways}
                    timedLabel={i18n.messageVisibilityTimed}
                    hideAfterLabel={i18n.messageVisibilityHideAfter}
                    secondsLabel={i18n.messageVisibilitySeconds}
                    onAlwaysVisibleChange={(always) =>
                      updateConfig('messageVisibility', { viewersAlwaysVisible: always })
                    }
                    onSecondsChange={(seconds) =>
                      updateConfig('messageVisibility', { viewersHideAfterSeconds: seconds })
                    }
                  />
                </div>
              </div>
            )}

            {section === 'channels' && (
              <div className="space-y-5">
                <SectionHeader title={i18n.sidebarChannels} description={i18n.sidebarChannelsIntro} />

                <div className="space-y-2">
                  <FieldLabel
                    htmlFor="channel"
                    help={i18n.twitchChannelHelp}
                    helpAriaLabel={i18n.helpAriaLabel}
                  >
                    {i18n.twitchChannelLabel}
                  </FieldLabel>
                  <input
                    className={inputClass}
                    id="channel"
                    type="text"
                    value={config?.twitch.channel ?? ''}
                    placeholder={i18n.channelPlaceholder}
                    onChange={({ target }) => updateConfig('twitch', { channel: target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel
                    htmlFor="kick-channel"
                    help={i18n.kickChannelHelp}
                    helpAriaLabel={i18n.helpAriaLabel}
                  >
                    {i18n.kickChannelLabel}
                  </FieldLabel>
                  <input
                    className={inputClass}
                    id="kick-channel"
                    type="text"
                    value={config?.kick.slug ?? ''}
                    placeholder={i18n.channelPlaceholder}
                    onChange={({ target }) => updateConfig('kick', { slug: target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel
                    htmlFor="youtube-channel"
                    help={i18n.youtubeChannelHelp}
                    helpAriaLabel={i18n.helpAriaLabel}
                  >
                    {i18n.youtubeChannelLabel}
                  </FieldLabel>
                  <input
                    className={inputClass}
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

                <div className="space-y-2">
                  <FieldLabel
                    htmlFor="tiktok-channel"
                    help={i18n.tiktokChannelHelp}
                    helpAriaLabel={i18n.helpAriaLabel}
                  >
                    {i18n.tiktokChannelLabel}
                  </FieldLabel>
                  <input
                    className={inputClass}
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
              </div>
            )}

            {section === 'appearance' && (
              <div className="space-y-6">
                <SectionHeader
                  title={i18n.sidebarAppearance}
                  description={i18n.sidebarAppearanceIntro}
                />

                <div className="space-y-4">
                  <h4 className="text-white font-medium text-sm">{i18n.fontTitle}</h4>

                  <div className="flex flex-col space-y-2">
                    <FieldLabel
                      htmlFor="font-size"
                      help={i18n.fontSizeHelp}
                      helpAriaLabel={i18n.helpAriaLabel}
                    >
                      {i18n.fontSizeLabel}: {config?.font?.size ?? 14}px
                    </FieldLabel>
                    <input
                      className="h-2 bg-red-700 rounded-lg appearance-none cursor-pointer slider"
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

                  <div className="space-y-2">
                    <FieldLabel
                      htmlFor="font-weight"
                      help={i18n.fontWeightHelp}
                      helpAriaLabel={i18n.helpAriaLabel}
                    >
                      {i18n.fontWeightLabel}: {fontWeightName(config?.font?.weight, i18n.fontWeights)}
                    </FieldLabel>
                    <select
                      className={inputClass}
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

                <div className="space-y-4">
                  <h4 className="text-white font-medium text-sm">{i18n.bgTitle}</h4>

                  <div className="space-y-2">
                    <FieldLabel
                      htmlFor="background-color"
                      help={i18n.bgDescription}
                      helpAriaLabel={i18n.helpAriaLabel}
                    >
                      {i18n.bgColorLabel}
                    </FieldLabel>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={config?.background?.background ?? ''}
                        className="w-12 h-10 rounded-md"
                        onChange={({ target }) =>
                          updateConfig('background', { background: target.value })
                        }
                      />
                      <input
                        className={inputClass}
                        id="background-color"
                        type="text"
                        value={config?.background?.background ?? ''}
                        placeholder={i18n.bgPlaceholder}
                        onChange={({ target }) =>
                          updateConfig('background', { background: target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <FieldLabel
                      htmlFor="bg-opacity"
                      help={i18n.bgOpacityHelp}
                      helpAriaLabel={i18n.helpAriaLabel}
                    >
                      {i18n.bgOpacityLabel}: {config?.background?.opacity ?? 30}%
                    </FieldLabel>
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
              </div>
            )}

            {section === 'obs' && (
              <div className="space-y-6">
                <SectionHeader title={i18n.sidebarObs} description={i18n.sidebarObsIntro} />

                <div className="space-y-2">
                  <FieldLabel
                    as="h4"
                    help={`${i18n.localServerDescription}\n\n${i18n.localServerHelp}`}
                    helpAriaLabel={i18n.helpAriaLabel}
                  >
                    {i18n.localServerTitle}
                  </FieldLabel>
                  <div className="flex gap-2">
                    <input
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      readOnly
                      value={localAppUrl}
                      aria-label={i18n.localServerCopyAria}
                    />
                    <Button
                      className="w-fit shrink-0"
                      type="button"
                      onClick={() => copyUrl(localAppUrl, 'app')}
                    >
                      {copiedField === 'app' ? i18n.obsCopied : i18n.obsCopyLink}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <FieldLabel
                    as="h4"
                    help={`${i18n.obsDescription}\n\n${i18n.obsHelp}`}
                    helpAriaLabel={i18n.helpAriaLabel}
                  >
                    {i18n.obsTitle}
                  </FieldLabel>
                  <div className="flex gap-2">
                    <input
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      readOnly
                      value={overlayUrl}
                      aria-label={i18n.obsCopyAria}
                    />
                    <Button
                      className="w-fit shrink-0"
                      type="button"
                      onClick={() => copyUrl(overlayUrl, 'overlay')}
                    >
                      {copiedField === 'overlay' ? i18n.obsCopied : i18n.obsCopyLink}
                    </Button>
                  </div>
                </div>

                <hr className="border-gray-700" />

                <ObsAppearanceSetting
                  i18n={i18n}
                  inputClass={inputClass}
                  appearance={config?.obsAppearance ?? DEFAULT_CONFIG_DATA.obsAppearance}
                  onChange={(value) => updateConfig('obsAppearance', value)}
                />
              </div>
            )}

            {section === 'filters' && (
              <div className="space-y-4">
                <SectionHeader title={i18n.sidebarFilters} description={i18n.sidebarFiltersIntro} />

                <FieldLabel as="h4" help={i18n.ignoreBotsDescription} helpAriaLabel={i18n.helpAriaLabel}>
                  {i18n.ignoreBotsTitle}
                </FieldLabel>

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
            )}
          </div>

          <div className="flex gap-2 items-center justify-end px-6 py-3 border-t border-gray-700 bg-gray-900">
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
    </div>
  )
}
