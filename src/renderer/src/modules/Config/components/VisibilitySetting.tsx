import type { LucideIcon } from 'lucide-react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '../../../shared/lib'
import { FieldLabel } from './FieldLabel'
import { SettingCard, SettingSwitch } from './SettingUi'

const DURATION_PRESETS = [5, 8, 15, 30]
const MIN_SECONDS = 1
const MAX_SECONDS = 300

function clampSeconds(value: number): number {
  if (!Number.isFinite(value)) return MIN_SECONDS
  return Math.min(MAX_SECONDS, Math.max(MIN_SECONDS, Math.round(value)))
}

type VisibilitySettingProps = {
  title: string
  help: string
  helpAriaLabel: string
  icon: LucideIcon
  alwaysVisible: boolean
  seconds: number
  alwaysLabel: string
  timedLabel: string
  hideAfterLabel: string
  secondsLabel: string
  onAlwaysVisibleChange: (always: boolean) => void
  onSecondsChange: (seconds: number) => void
}

export function VisibilitySetting({
  title,
  help,
  helpAriaLabel,
  icon,
  alwaysVisible,
  seconds,
  alwaysLabel,
  timedLabel,
  hideAfterLabel,
  secondsLabel,
  onAlwaysVisibleChange,
  onSecondsChange
}: VisibilitySettingProps) {
  const duration = clampSeconds(seconds)

  const step = (delta: number) => {
    onSecondsChange(clampSeconds(duration + delta))
  }

  return (
    <SettingCard
      icon={icon}
      title={title}
      help={help}
      helpAriaLabel={helpAriaLabel}
      hint={alwaysVisible ? alwaysLabel : undefined}
      action={
        <SettingSwitch
          checked={alwaysVisible}
          label={alwaysVisible ? alwaysLabel : timedLabel}
          onChange={onAlwaysVisibleChange}
        />
      }
    >
      {!alwaysVisible && (
        <div className="space-y-2">
          <FieldLabel as="span" help={help} helpAriaLabel={helpAriaLabel}>
            {hideAfterLabel}
          </FieldLabel>
          <div className="flex items-center gap-1.5" role="radiogroup" aria-label={hideAfterLabel}>
            {DURATION_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                role="radio"
                aria-checked={duration === preset}
                onClick={() => onSecondsChange(preset)}
                className={cn(
                  'h-8 min-w-10 shrink-0 rounded-md border px-2 text-xs font-medium transition-colors',
                  duration === preset
                    ? 'border-primary-500 bg-primary-600/20 text-white'
                    : 'border-gray-700 bg-gray-900/70 text-gray-300 hover:border-gray-500 hover:text-white'
                )}
              >
                {preset}s
              </button>
            ))}
            <button
              type="button"
              className="flex size-8 shrink-0 items-center justify-center rounded-md border border-gray-700 bg-gray-900 text-gray-300 hover:border-gray-500 hover:text-white"
              aria-label="-"
              onClick={() => step(-1)}
            >
              <Minus size={14} />
            </button>
            <input
              className="h-8 w-12 shrink-0 rounded-md border border-gray-700 bg-gray-950/60 text-center text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              type="number"
              min={MIN_SECONDS}
              max={MAX_SECONDS}
              value={duration}
              onChange={({ target }) => onSecondsChange(clampSeconds(parseInt(target.value, 10)))}
            />
            <button
              type="button"
              className="flex size-8 shrink-0 items-center justify-center rounded-md border border-gray-700 bg-gray-900 text-gray-300 hover:border-gray-500 hover:text-white"
              aria-label="+"
              onClick={() => step(1)}
            >
              <Plus size={14} />
            </button>
            <span className="shrink-0 text-xs text-gray-400">{secondsLabel}</span>
          </div>
        </div>
      )}
    </SettingCard>
  )
}
