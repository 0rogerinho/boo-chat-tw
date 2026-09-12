import { useCallback, useEffect, useState } from 'react'
import Header from './components/Header'
import Sidebar, { type ConfigSection } from './components/Sidebar'
import { FieldLabel } from './components/FieldLabel'
import { SectionHeader } from './components/SectionHeader'
import { SoundSetting } from './components/SoundSetting'
import { TtsSetting } from './components/TtsSetting'
import { VisibilitySetting } from './components/VisibilitySetting'
import { ObsAppearanceSetting } from './components/ObsAppearanceSetting'
import { AppearanceSetting } from './components/AppearanceSetting'
import { ChannelField } from './components/ChannelField'
import { PrimaryAction, SettingCard, SettingSwitch, settingStackClass } from './components/SettingUi'
import { DEFAULT_CONFIG_DATA } from '../../shared/constants/defaultConfig'
import Button from '../../shared/components/Button'
import { ErrorNotification, SuccessNotification } from '../../shared/components/ErrorNotification'

import { getMessageSoundLabels, parseMessageSound } from '../../shared/constants/messageSounds'
import { APP_LANGUAGE_OPTIONS, getConfigI18n, normalizeLanguage } from '../../shared/i18n'
import { useModel } from './hooks/useModel'
import { ChevronDown, Copy, Filter, Image, Info, Languages, Link2, MessagesSquare, Monitor, Smile } from 'lucide-react'
import twitchLogo from '../../shared/assets/twitch-logo.png'
import kickLogo from '../../shared/assets/kick-logo.webp'
import youtubeLogo from '../../shared/assets/youtube-logo.png'
import tiktokLogo from '../../shared/assets/tiktok-logo.png'

function LinkHowTo({ label, steps }: { label: string; steps: string }) {
  return (
    <div className="rounded-md border border-primary-500/25 bg-primary-600/10 px-2.5 py-2">
      <p className="text-[11px] font-medium text-primary-200">{label}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-gray-300 whitespace-pre-wrap">{steps}</p>
    </div>
  )
}

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

  const [section, setSection] = useState<ConfigSection>('channels')
  const [botDraft, setBotDraft] = useState('')
  const [overlayUrl, setOverlayUrl] = useState('')
  const [liveUrl, setLiveUrl] = useState('')
  const [copiedOverlay, setCopiedOverlay] = useState(false)
  const [copiedLive, setCopiedLive] = useState(false)
  const language = normalizeLanguage(config?.language)
  const i18n = getConfigI18n(language)
  const soundLabels = getMessageSoundLabels(language)

  useEffect(() => {
    let cancelled = false

    const loadLocalUrls = async () => {
      for (let attempt = 0; attempt < 10; attempt++) {
        try {
          const response = await window.electron.ipcRenderer.invoke('get-overlay-url')
          if (response?.success && (response.appUrl || response.url || response.liveUrl)) {
            if (!cancelled) {
              setOverlayUrl(response.url || '')
              setLiveUrl(response.liveUrl || response.appUrl || '')
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

  const copyUrl = async (url: string, kind: 'overlay' | 'live') => {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      if (kind === 'overlay') {
        setCopiedOverlay(true)
        window.setTimeout(() => setCopiedOverlay(false), 2000)
      } else {
        setCopiedLive(true)
        window.setTimeout(() => setCopiedLive(false), 2000)
      }
    } catch (error) {
      console.error('Erro ao copiar link:', error)
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
    'w-full px-3 py-2 bg-gray-950/60 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'

  return (
    <div className="flex flex-col w-screen h-screen rounded-[8px] overflow-hidden bg-gray-900 backdrop-blur-sm border border-gray-600">
      <Header />

      <ErrorNotification error={error} onClose={() => setError(null)} />
      <SuccessNotification message={successMessage} onClose={() => setSuccessMessage(null)} />

      <div className="flex flex-1 min-h-0">
        <Sidebar section={section} onSelect={setSection} i18n={i18n} />

        <form className="flex flex-1 min-w-0 flex-col" onSubmit={handleUpdateConfig}>
          <div className="flex-1 overflow-y-auto scroll px-6 py-5 space-y-5">
            {section === 'general' && (
              <div className="space-y-3">
                <SectionHeader title={i18n.sidebarGeneral} description={i18n.sidebarGeneralIntro} />

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-gray-800 text-gray-300">
                      <Languages size={16} />
                    </span>
                    <FieldLabel
                      htmlFor="language"
                      help={i18n.languageHelp}
                      helpAriaLabel={i18n.helpAriaLabel}
                    >
                      {i18n.languageLabel}
                    </FieldLabel>
                  </div>
                  <div className="relative">
                    <select
                      id="language"
                      className="w-full appearance-none px-3 py-2 pr-10 bg-gray-950/60 border border-gray-700 rounded-[8px] text-white placeholder-gray-400 [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={language}
                      onChange={({ target }) => setLanguage(normalizeLanguage(target.value))}
                    >
                      {APP_LANGUAGE_OPTIONS.map((option) => (
                        <option key={option.code} value={option.code}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                </div>

                <div className={settingStackClass}>
                  <SoundSetting
                    title={i18n.soundTitle}
                    help={i18n.soundDescription}
                    helpAriaLabel={i18n.helpAriaLabel}
                    onLabel={i18n.ttsOn}
                    offLabel={i18n.ttsOff}
                    offHint={i18n.soundDescription}
                    soundLabel={i18n.soundTypeLabel}
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

                  <TtsSetting
                    title={i18n.ttsTitle}
                    help={i18n.ttsDescription}
                    helpAriaLabel={i18n.helpAriaLabel}
                    onLabel={i18n.ttsOn}
                    offLabel={i18n.ttsOff}
                    volumeLabel={i18n.ttsVolumeLabel}
                    volumeHelp={i18n.ttsVolumeHelp}
                    rateLabel={i18n.ttsRateLabel}
                    rateHelp={i18n.ttsRateHelp}
                    readAuthorLabel={i18n.ttsReadAuthorLabel}
                    readAuthorHelp={i18n.ttsReadAuthorHelp}
                    mutedLabel={i18n.mutedLabel}
                    maxLabel={i18n.maxLabel}
                    slowLabel={i18n.ttsSlowLabel}
                    fastLabel={i18n.ttsFastLabel}
                    testLabel={i18n.ttsTestLabel}
                    testAuthor={i18n.ttsTestAuthor}
                    testMessage={i18n.ttsTestMessage}
                    generatingLabel={i18n.ttsGenerating}
                    playErrorLabel={i18n.ttsPlayError}
                    retryLabel={i18n.ttsRetryLabel}
                    exampleLabel={i18n.ttsExampleLabel}
                    offHint={i18n.ttsOffHint}
                    voiceLabel={i18n.ttsVoiceLabel}
                    voiceHelp={i18n.ttsVoiceHelp}
                    voiceHints={{
                      'pt-BR-faber': i18n.ttsVoiceHintFaber,
                      'pt-BR-cadu': i18n.ttsVoiceHintCadu,
                      'pt-BR-jeff': i18n.ttsVoiceHintJeff
                    }}
                    language={language}
                    enabled={config?.notifications?.ttsEnabled === true}
                    volume={config?.notifications?.ttsVolume ?? 85}
                    rate={config?.notifications?.ttsRate ?? 1}
                    readAuthor={config?.notifications?.ttsReadAuthor !== false}
                    voice={config?.notifications?.ttsVoice ?? 'auto'}
                    onEnabledChange={(ttsEnabled) =>
                      updateConfig('notifications', {
                        ...config?.notifications,
                        ttsEnabled
                      })
                    }
                    onVolumeChange={(ttsVolume) =>
                      updateConfig('notifications', {
                        ...config?.notifications,
                        ttsVolume
                      })
                    }
                    onRateChange={(ttsRate) =>
                      updateConfig('notifications', {
                        ...config?.notifications,
                        ttsRate
                      })
                    }
                    onReadAuthorChange={(ttsReadAuthor) =>
                      updateConfig('notifications', {
                        ...config?.notifications,
                        ttsReadAuthor
                      })
                    }
                    onVoiceChange={(ttsVoice) =>
                      updateConfig('notifications', {
                        ...config?.notifications,
                        ttsVoice
                      })
                    }
                  />

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

                  <SettingCard
                    icon={Smile}
                    title={i18n.emotesTitle}
                    help={i18n.emotesHelp}
                    helpAriaLabel={i18n.helpAriaLabel}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <FieldLabel as="span" help={i18n.emotesHelp} helpAriaLabel={i18n.helpAriaLabel}>
                        {i18n.emotesSeventvLabel}
                      </FieldLabel>
                      <SettingSwitch
                        checked={config?.emotes?.seventv !== false}
                        label={config?.emotes?.seventv !== false ? i18n.emotesOn : i18n.emotesOff}
                        onChange={(seventv) => updateConfig('emotes', { seventv })}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <FieldLabel as="span" help={i18n.emotesHelp} helpAriaLabel={i18n.helpAriaLabel}>
                        {i18n.emotesBetterttvLabel}
                      </FieldLabel>
                      <SettingSwitch
                        checked={config?.emotes?.betterttv !== false}
                        label={config?.emotes?.betterttv !== false ? i18n.emotesOn : i18n.emotesOff}
                        onChange={(betterttv) => updateConfig('emotes', { betterttv })}
                      />
                    </div>
                  </SettingCard>

                  <SettingCard
                    icon={Image}
                    title={i18n.linkImagesTitle}
                    help={i18n.linkImagesHelp}
                    helpAriaLabel={i18n.helpAriaLabel}
                    hint={i18n.linkImagesHelp}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <FieldLabel
                        as="span"
                        help={i18n.linkImagesHelp}
                        helpAriaLabel={i18n.helpAriaLabel}
                      >
                        {i18n.linkImagesLabel}
                      </FieldLabel>
                      <SettingSwitch
                        checked={config?.media?.linkImages === true}
                        label={config?.media?.linkImages === true ? i18n.emotesOn : i18n.emotesOff}
                        onChange={(linkImages) => updateConfig('media', { linkImages })}
                      />
                    </div>
                  </SettingCard>
                </div>
              </div>
            )}

            {section === 'channels' && (
              <div className="space-y-5">
                <SectionHeader
                  title={i18n.sidebarChannels}
                  description={i18n.sidebarChannelsIntro}
                />

                <ChannelField
                  id="channel"
                  iconSrc={twitchLogo}
                  iconClassName="size-6"
                  title={i18n.twitchChannelLabel}
                  help={i18n.twitchChannelHelp}
                  helpAriaLabel={i18n.helpAriaLabel}
                  value={config?.twitch.channel ?? ''}
                  placeholder={i18n.channelPlaceholder}
                  onChange={(channel) => updateConfig('twitch', { channel })}
                />

                <ChannelField
                  id="kick-channel"
                  iconSrc={kickLogo}
                  title={i18n.kickChannelLabel}
                  help={i18n.kickChannelHelp}
                  helpAriaLabel={i18n.helpAriaLabel}
                  value={config?.kick.slug ?? ''}
                  placeholder={i18n.channelPlaceholder}
                  onChange={(slug) => updateConfig('kick', { slug })}
                />

                <ChannelField
                  id="youtube-channel"
                  iconSrc={youtubeLogo}
                  title={i18n.youtubeChannelLabel}
                  help={i18n.youtubeChannelHelp}
                  helpAriaLabel={i18n.helpAriaLabel}
                  value={config?.youtube?.channelName ?? ''}
                  placeholder={i18n.youtubePlaceholder}
                  onChange={(channelName) => updateConfig('youtube', { channelName })}
                />

                <ChannelField
                  id="tiktok-channel"
                  iconSrc={tiktokLogo}
                  title={i18n.tiktokChannelLabel}
                  help={i18n.tiktokChannelHelp}
                  helpAriaLabel={i18n.helpAriaLabel}
                  value={config?.tiktok?.channel ?? ''}
                  placeholder={i18n.tiktokPlaceholder}
                  onChange={(channel) => updateConfig('tiktok', { channel })}
                />
              </div>
            )}

            {section === 'appearance' && (
              <div className="space-y-3">
                <SectionHeader
                  title={i18n.sidebarAppearance}
                  description={i18n.sidebarAppearanceIntro}
                />

                <AppearanceSetting
                  i18n={i18n}
                  inputClass={inputClass}
                  fontSize={config?.font?.size ?? 14}
                  fontWeight={config?.font?.weight ?? 400}
                  background={config?.background?.background ?? ''}
                  opacity={config?.background?.opacity ?? 30}
                  platformColorDot={config?.appearance?.platformColorDot === true}
                  onFontSizeChange={(size) =>
                    updateConfig('font', {
                      ...config?.font,
                      size
                    })
                  }
                  onFontWeightChange={(weight) =>
                    updateConfig('font', {
                      ...config?.font,
                      weight
                    })
                  }
                  onBackgroundChange={(background) => updateConfig('background', { background })}
                  onOpacityChange={(opacity) =>
                    updateConfig('background', {
                      ...config?.background,
                      opacity
                    })
                  }
                  onPlatformColorDotChange={(platformColorDot) =>
                    updateConfig('appearance', { platformColorDot })
                  }
                />
              </div>
            )}

            {section === 'obs' && (
              <div className="space-y-3">
                <SectionHeader title={i18n.sidebarObs} description={i18n.sidebarObsIntro} />

                <div className={settingStackClass}>
                  <SettingCard
                    icon={Link2}
                    title={i18n.obsTitle}
                    help={`${i18n.obsDescription}\n\n${i18n.obsHelp}`}
                    helpAriaLabel={i18n.helpAriaLabel}
                    hint={i18n.obsDescription}
                  >
                    <LinkHowTo label={i18n.obsHowToLabel} steps={i18n.obsHelp} />
                    <input
                      className="w-full px-3 py-2 bg-gray-950/60 border border-gray-700 rounded-md text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      readOnly
                      value={overlayUrl}
                      aria-label={i18n.obsCopyAria}
                    />
                    <PrimaryAction className="w-full" onClick={() => void copyUrl(overlayUrl, 'overlay')}>
                      <Copy size={14} />
                      {copiedOverlay ? i18n.obsCopied : i18n.obsCopyLink}
                    </PrimaryAction>
                  </SettingCard>

                  <ObsAppearanceSetting
                    i18n={i18n}
                    idPrefix="obs"
                    inputClass={inputClass}
                    appearance={config?.obsAppearance ?? DEFAULT_CONFIG_DATA.obsAppearance}
                    copy={{
                      title: i18n.obsAppearanceTitle,
                      description: i18n.obsAppearanceDescription,
                      fontFamilyHelp: i18n.obsFontFamilyHelp,
                      fontSizeHelp: i18n.obsFontSizeHelp,
                      fontWeightHelp: i18n.obsFontWeightHelp,
                      pageBgTitle: i18n.obsPageBgTitle,
                      pageBgColorLabel: i18n.obsPageBgColorLabel,
                      pageBgColorHelp: i18n.obsPageBgColorHelp,
                      pageBgOpacityLabel: i18n.obsPageBgOpacityLabel,
                      pageBgOpacityHelp: i18n.obsPageBgOpacityHelp,
                      messageBgTitle: i18n.obsMessageBgTitle,
                      messageBgHelp: i18n.obsMessageBgHelp
                    }}
                    onChange={(value) => updateConfig('obsAppearance', value)}
                  />
                </div>
              </div>
            )}

            {section === 'live' && (
              <div className="space-y-3">
                <SectionHeader title={i18n.sidebarLive} description={i18n.sidebarLiveIntro} />

                <div className={settingStackClass}>
                  <SettingCard
                    icon={Monitor}
                    title={i18n.localServerTitle}
                    help={`${i18n.localServerDescription}\n\n${i18n.localServerHelp}`}
                    helpAriaLabel={i18n.helpAriaLabel}
                    hint={i18n.localServerDescription}
                  >
                    <LinkHowTo label={i18n.liveHowToLabel} steps={i18n.localServerHelp} />
                    <input
                      className="w-full px-3 py-2 bg-gray-950/60 border border-gray-700 rounded-md text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      readOnly
                      value={liveUrl}
                      aria-label={i18n.localServerCopyAria}
                    />
                    <PrimaryAction className="w-full" onClick={() => void copyUrl(liveUrl, 'live')}>
                      <Copy size={14} />
                      {copiedLive ? i18n.obsCopied : i18n.obsCopyLink}
                    </PrimaryAction>
                  </SettingCard>

                  <ObsAppearanceSetting
                    i18n={i18n}
                    idPrefix="live"
                    inputClass={inputClass}
                    appearance={config?.liveAppearance ?? DEFAULT_CONFIG_DATA.liveAppearance}
                    copy={{
                      title: i18n.liveAppearanceTitle,
                      description: i18n.liveAppearanceDescription,
                      fontFamilyHelp: i18n.liveFontFamilyHelp,
                      fontSizeHelp: i18n.liveFontSizeHelp,
                      fontWeightHelp: i18n.liveFontWeightHelp,
                      pageBgTitle: i18n.livePageBgTitle,
                      pageBgColorLabel: i18n.livePageBgColorLabel,
                      pageBgColorHelp: i18n.livePageBgColorHelp,
                      pageBgOpacityLabel: i18n.livePageBgOpacityLabel,
                      pageBgOpacityHelp: i18n.livePageBgOpacityHelp,
                      messageBgTitle: i18n.liveMessageBgTitle,
                      messageBgHelp: i18n.liveMessageBgHelp
                    }}
                    onChange={(value) => updateConfig('liveAppearance', value)}
                  />
                </div>
              </div>
            )}

            {section === 'filters' && (
              <div className="space-y-3">
                <SectionHeader title={i18n.sidebarFilters} description={i18n.sidebarFiltersIntro} />

                <div className={settingStackClass}>
                  <SettingCard
                    icon={Filter}
                    title={i18n.ignoreBotsTitle}
                    help={i18n.ignoreBotsDescription}
                    helpAriaLabel={i18n.helpAriaLabel}
                    hint={i18n.ignoreBotsDescription}
                  >
                    <div
                      id="ignore-bots"
                      className="w-full min-h-[3rem] px-2 py-1.5 bg-gray-950/60 border border-gray-700 rounded-md flex flex-wrap gap-1.5 items-center focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent"
                      role="group"
                      aria-label={i18n.ignoreBotsAriaLabel}
                    >
                      {(config?.bots?.userBots ?? []).map((name, index) => (
                        <span
                          key={`${name}-${index}`}
                          className="inline-flex items-center gap-1 rounded-md border border-gray-600 bg-gray-800 pl-2 pr-1 py-0.5 text-sm text-white"
                        >
                          <span className="max-w-[200px] truncate" title={name}>
                            {name}
                          </span>
                          <button
                            type="button"
                            className="shrink-0 rounded p-0.5 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
                            aria-label={`${i18n.removeBotAriaPrefix} ${name}`}
                            onClick={() => removeBotTag(index)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <input
                        className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-sm text-white placeholder-gray-400 focus:outline-none"
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
                  </SettingCard>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-gray-700 bg-gray-900 px-6 py-3">
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
