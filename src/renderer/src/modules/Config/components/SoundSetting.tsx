import { useRef } from 'react'
import { Play, Volume2 } from 'lucide-react'
import {
  MESSAGE_SOUND_IDS,
  type MessageSoundId,
  parseMessageSound
} from '../../../shared/constants/messageSounds'
import { playIncomingMessageNotification } from '../../../shared/utils/messageNotification'
import { FieldLabel } from './FieldLabel'
import { ChoiceCard, PrimaryAction, SettingCard, SettingSwitch, SliderField } from './SettingUi'

const SOUND_CHOICES = MESSAGE_SOUND_IDS.filter((id) => id !== 'none')

type SoundSettingProps = {
  title: string
  help: string
  helpAriaLabel: string
  onLabel: string
  offLabel: string
  offHint: string
  soundLabel: string
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
  onLabel,
  offLabel,
  offHint,
  soundLabel,
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
  const lastSoundRef = useRef<Exclude<MessageSoundId, 'none'>>(
    selected === 'none' ? 'ding' : selected
  )
  if (selected !== 'none') lastSoundRef.current = selected

  const preview = (nextSound: MessageSoundId, nextVolume = volumeValue) => {
    if (nextSound === 'none') return
    void playIncomingMessageNotification({
      messageSound: nextSound,
      messageSoundVolume: nextVolume
    })
  }

  return (
    <SettingCard
      icon={Volume2}
      title={title}
      help={help}
      helpAriaLabel={helpAriaLabel}
      hint={enabled ? undefined : offHint}
      action={
        <SettingSwitch
          checked={enabled}
          label={enabled ? onLabel : offLabel}
          onChange={(next) => {
            onSoundChange(next ? lastSoundRef.current : 'none')
          }}
        />
      }
    >
      {enabled && (
        <div className="space-y-3">
          <div className="space-y-2">
            <FieldLabel as="span" help={help} helpAriaLabel={helpAriaLabel}>
              {soundLabel}
            </FieldLabel>
            <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label={soundLabel}>
              {SOUND_CHOICES.map((id) => (
                <ChoiceCard
                  key={id}
                  active={selected === id}
                  title={soundLabels[id]}
                  onClick={() => {
                    onSoundChange(id)
                    preview(id)
                  }}
                />
              ))}
            </div>
          </div>

          <SliderField
            id="message-sound-volume"
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

          <PrimaryAction className="w-full" onClick={() => preview(selected)}>
            <Play size={12} fill="currentColor" />
            {testLabel}
          </PrimaryAction>
        </div>
      )}
    </SettingCard>
  )
}
