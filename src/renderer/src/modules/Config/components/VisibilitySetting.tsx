import type { LucideIcon } from 'lucide-react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '../../../shared/lib'
import { FieldLabel } from './FieldLabel'

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
  icon: Icon,
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
    <section className="rounded-lg border border-gray-700 bg-gray-800/40 p-3 space-y-3">
      <div className="flex items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-gray-900 text-gray-300">
          <Icon size={16} />
        </span>
        <FieldLabel as="h4" help={help} helpAriaLabel={helpAriaLabel}>
          {title}
        </FieldLabel>
      </div>

      <div
        className="grid grid-cols-2 gap-1 rounded-md bg-gray-900/80 p-1"
        role="radiogroup"
        aria-label={title}
      >
        <ModeButton
          active={alwaysVisible}
          onClick={() => onAlwaysVisibleChange(true)}
        >
          {alwaysLabel}
        </ModeButton>
        <ModeButton
          active={!alwaysVisible}
          onClick={() => onAlwaysVisibleChange(false)}
        >
          {timedLabel}
        </ModeButton>
      </div>

      {!alwaysVisible && (
        <div className="space-y-2 pt-0.5">
          <p className="text-xs text-gray-400">{hideAfterLabel}</p>
          <div className="flex flex-wrap items-center gap-2">
            {DURATION_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onSecondsChange(preset)}
                className={cn(
                  'h-7 rounded-md px-2.5 text-xs font-medium transition-colors',
                  duration === preset
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-900 text-gray-300 hover:bg-gray-700 hover:text-white'
                )}
              >
                {preset}s
              </button>
            ))}

            <div className="flex items-center gap-1">
              <button
                type="button"
                className="flex size-7 items-center justify-center rounded-md bg-gray-900 text-gray-300 hover:bg-gray-700 hover:text-white"
                aria-label="-"
                onClick={() => step(-1)}
              >
                <Minus size={14} />
              </button>
              <input
                className="h-7 w-12 rounded-md border border-gray-700 bg-gray-900 text-center text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                type="number"
                min={MIN_SECONDS}
                max={MAX_SECONDS}
                value={duration}
                onChange={({ target }) => onSecondsChange(clampSeconds(parseInt(target.value, 10)))}
              />
              <button
                type="button"
                className="flex size-7 items-center justify-center rounded-md bg-gray-900 text-gray-300 hover:bg-gray-700 hover:text-white"
                aria-label="+"
                onClick={() => step(1)}
              >
                <Plus size={14} />
              </button>
              <span className="text-xs text-gray-400">{secondsLabel}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function ModeButton({
  active,
  onClick,
  children
}: {
  active: boolean
  onClick: () => void
  children: string
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={cn(
        'h-8 rounded px-2 text-xs font-medium transition-colors',
        active
          ? 'bg-primary-600 text-white shadow-sm'
          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
      )}
    >
      {children}
    </button>
  )
}
