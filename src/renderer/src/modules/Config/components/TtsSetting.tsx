import { useRef, useState } from 'react'
import { Loader2, Play, Speech } from 'lucide-react'
import {
  getTtsVoicesForLanguage,
  parseTtsVoice,
  resolveTtsVoice,
  type TtsVoiceId
} from '../../../shared/constants/ttsVoices'
import { normalizeLanguage } from '../../../shared/i18n'
import {
  cancelMessageTts,
  formatSpeakerCue,
  speakIncomingChatMessage,
  unlockTtsAudio
} from '../../../shared/utils/messageTts'
import { FieldLabel } from './FieldLabel'
import { ChoiceCard, PrimaryAction, SettingCard, SettingSwitch, SliderField } from './SettingUi'

type TtsSettingProps = {
  title: string
  help: string
  helpAriaLabel: string
  onLabel: string
  offLabel: string
  volumeLabel: string
  volumeHelp: string
  rateLabel: string
  rateHelp: string
  readAuthorLabel: string
  readAuthorHelp: string
  mutedLabel: string
  maxLabel: string
  slowLabel: string
  fastLabel: string
  testLabel: string
  testAuthor: string
  testMessage: string
  generatingLabel: string
  playErrorLabel: string
  retryLabel: string
  exampleLabel: string
  offHint: string
  voiceLabel: string
  voiceHelp: string
  voiceHints: Record<Exclude<TtsVoiceId, 'auto'>, string>
  language?: unknown
  enabled: boolean
  volume: number
  rate: number
  readAuthor: boolean
  voice: TtsVoiceId
  onEnabledChange: (enabled: boolean) => void
  onVolumeChange: (volume: number) => void
  onRateChange: (rate: number) => void
  onReadAuthorChange: (readAuthor: boolean) => void
  onVoiceChange: (voice: TtsVoiceId) => void
}

async function preview(options: {
  language?: unknown
  volume: number
  rate: number
  readAuthor: boolean
  voice: TtsVoiceId
  author: string
  message: string
}): Promise<boolean> {
  await unlockTtsAudio()
  cancelMessageTts()
  return speakIncomingChatMessage({
    author: options.author,
    message: options.message,
    language: options.language,
    settings: {
      ttsEnabled: true,
      ttsVolume: options.volume,
      ttsRate: options.rate,
      ttsReadAuthor: options.readAuthor,
      ttsVoice: options.voice
    }
  })
}

export function TtsSetting({
  title,
  help,
  helpAriaLabel,
  onLabel,
  offLabel,
  volumeLabel,
  volumeHelp,
  rateLabel,
  rateHelp,
  readAuthorLabel,
  readAuthorHelp,
  mutedLabel,
  maxLabel,
  slowLabel,
  fastLabel,
  testLabel,
  testAuthor,
  testMessage,
  generatingLabel,
  playErrorLabel,
  retryLabel,
  exampleLabel,
  offHint,
  voiceLabel,
  voiceHelp,
  voiceHints,
  language,
  enabled,
  volume,
  rate,
  readAuthor,
  voice,
  onEnabledChange,
  onVolumeChange,
  onRateChange,
  onReadAuthorChange,
  onVoiceChange
}: TtsSettingProps) {
  const volumeValue = Math.min(100, Math.max(0, volume))
  const rateValue = Math.min(2, Math.max(0.5, Math.round(rate * 10) / 10))
  const languageCode = normalizeLanguage(language)
  const selectedVoice = resolveTtsVoice(parseTtsVoice(voice), languageCode)
  const languageVoices = getTtsVoicesForLanguage(languageCode)
  const [previewState, setPreviewState] = useState<'idle' | 'loading' | 'error'>('idle')
  const previewRequestRef = useRef(0)
  const speakerCue = readAuthor ? formatSpeakerCue(testAuthor, languageCode) : ''
  const spokenExample = speakerCue ? `${speakerCue}. ${testMessage}` : testMessage

  const runPreview = async (nextVoice = selectedVoice) => {
    const requestId = ++previewRequestRef.current
    setPreviewState('loading')
    try {
      const played = await preview({
        language,
        volume: volumeValue,
        rate: rateValue,
        readAuthor,
        voice: nextVoice,
        author: testAuthor,
        message: testMessage
      })
      if (previewRequestRef.current !== requestId) return
      setPreviewState(played ? 'idle' : 'error')
    } catch {
      if (previewRequestRef.current !== requestId) return
      setPreviewState('error')
    }
  }

  return (
    <SettingCard
      icon={Speech}
      title={title}
      help={help}
      helpAriaLabel={helpAriaLabel}
      hint={enabled ? undefined : offHint}
      action={
        <SettingSwitch
          checked={enabled}
          label={enabled ? onLabel : offLabel}
          onChange={(next) => {
            if (!next) cancelMessageTts()
            onEnabledChange(next)
          }}
        />
      }
    >
      {enabled && (
        <div className="space-y-3">
          <div className="space-y-2">
            <FieldLabel as="span" help={voiceHelp} helpAriaLabel={helpAriaLabel}>
              {voiceLabel}
            </FieldLabel>
            <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label={voiceLabel}>
              {languageVoices.map((option) => (
                <ChoiceCard
                  key={option.id}
                  active={selectedVoice === option.id}
                  title={option.name}
                  hint={voiceHints[option.id]}
                  onClick={() => {
                    onVoiceChange(option.id)
                    void runPreview(option.id)
                  }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SliderField
              id="tts-volume"
              label={volumeLabel}
              help={volumeHelp}
              helpAriaLabel={helpAriaLabel}
              value={volumeValue}
              display={`${volumeValue}%`}
              min={0}
              max={100}
              minLabel={mutedLabel}
              maxLabel={maxLabel}
              onChange={onVolumeChange}
            />
            <SliderField
              id="tts-rate"
              label={rateLabel}
              help={rateHelp}
              helpAriaLabel={helpAriaLabel}
              value={Math.round(rateValue * 10)}
              display={`${rateValue.toFixed(1)}x`}
              min={5}
              max={20}
              minLabel={slowLabel}
              maxLabel={fastLabel}
              onChange={(value) => onRateChange(value / 10)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <FieldLabel as="span" help={readAuthorHelp} helpAriaLabel={helpAriaLabel}>
                {readAuthorLabel}
              </FieldLabel>
              <SettingSwitch checked={readAuthor} label={readAuthorLabel} onChange={onReadAuthorChange} />
            </div>
            <p className="text-[11px] text-gray-400">
              {exampleLabel}:{' '}
              <span className="text-gray-200 italic">“{spokenExample}”</span>
            </p>
          </div>

          {previewState === 'error' && (
            <div className="flex items-center justify-between gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-2">
              <p className="text-xs text-amber-200 leading-relaxed">{playErrorLabel}</p>
              <button
                type="button"
                onClick={() => void runPreview()}
                className="shrink-0 rounded-md bg-amber-500/20 px-2 py-1 text-[11px] font-medium text-amber-100 hover:bg-amber-500/30"
              >
                {retryLabel}
              </button>
            </div>
          )}

          <PrimaryAction
            className="w-full"
            disabled={previewState === 'loading'}
            onClick={() => void runPreview()}
          >
            {previewState === 'loading' ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Play size={12} fill="currentColor" />
            )}
            {previewState === 'loading' ? generatingLabel : testLabel}
          </PrimaryAction>
        </div>
      )}
    </SettingCard>
  )
}
