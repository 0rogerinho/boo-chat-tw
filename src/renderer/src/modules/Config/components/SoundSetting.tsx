import { Play, Volume2 } from 'lucide-react'
import {
  MESSAGE_SOUND_IDS,
  type MessageSoundId,
  parseMessageSound
} from '../../../shared/constants/messageSounds'
import { playIncomingMessageNotification } from '../../../shared/utils/messageNotification'
import { cn } from '../../../shared/lib'
import { FieldLabel } from './FieldLabel'

type SoundSettingProps = {
  title: string
  help: string
  helpAriaLabel: string
  volumeLabel: string
  volumeHelp: string
  mutedLabel: string
  maxLabel: string
  testLabel: string
  volume: number
  sound: MessageSoundId
  soundLabels: Record<MessageSoundId, string>
  onVolumeChange: (volume: number) => void
  onSoundChange: (sound: MessageSoundId) => void
}

export function SoundSetting({
  title,
  help,
  helpAriaLabel,
  volumeLabel,
  volumeHelp,
  mutedLabel,
  maxLabel,
  testLabel,
  volume,
  sound,
  soundLabels,
  onVolumeChange,
  onSoundChange
}: SoundSettingProps) {
  const selected = parseMessageSound(sound)
  const enabled = selected !== 'none'
  const volumeValue = Math.min(100, Math.max(0, volume))

  const preview = (nextSound: MessageSoundId, nextVolume = volumeValue) => {
    if (nextSound === 'none') return
    void playIncomingMessageNotification({
      messageSound: nextSound,
      messageSoundVolume: nextVolume
    })
  }

  return (
    <section className="rounded-lg border border-gray-700 bg-gray-800/40 p-3 space-y-3">
      <div className="flex items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-gray-900 text-gray-300">
          <Volume2 size={16} />
        </span>
        <FieldLabel as="h4" help={help} helpAriaLabel={helpAriaLabel} className="flex-1">
          {title}
        </FieldLabel>
        <button
          type="button"
          disabled={!enabled}
          onClick={() => preview(selected)}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-gray-900 px-2.5 text-xs font-medium text-gray-200 transition-colors hover:bg-gray-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Play size={12} fill="currentColor" />
          {testLabel}
        </button>
      </div>

      <div
        className="grid grid-cols-2 gap-1 rounded-md bg-gray-900/80 p-1"
        role="radiogroup"
        aria-label={title}
      >
        {MESSAGE_SOUND_IDS.map((id) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={selected === id}
            onClick={() => {
              onSoundChange(id)
              preview(id)
            }}
            className={cn(
              'h-8 rounded px-2 text-xs font-medium transition-colors truncate',
              selected === id
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            )}
          >
            {soundLabels[id]}
          </button>
        ))}
      </div>

      {enabled && (
        <div className="space-y-2">
          <FieldLabel
            htmlFor="message-sound-volume"
            help={volumeHelp}
            helpAriaLabel={helpAriaLabel}
          >
            {volumeLabel}: {volumeValue}%
          </FieldLabel>
          <input
            id="message-sound-volume"
            type="range"
            min={0}
            max={100}
            className="h-2 w-full bg-red-700 rounded-lg appearance-none cursor-pointer slider"
            value={volumeValue}
            onChange={({ target }) => onVolumeChange(parseInt(target.value, 10))}
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>{mutedLabel}</span>
            <span>{maxLabel}</span>
          </div>
        </div>
      )}
    </section>
  )
}
