import type { LucideIcon } from 'lucide-react'
import { ChevronDown } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import { cn } from '../../../shared/lib'
import { FieldLabel } from './FieldLabel'

export function SelectField({
  id,
  label,
  help,
  helpAriaLabel,
  value,
  onChange,
  children
}: {
  id: string
  label: string
  help?: string
  helpAriaLabel: string
  value: string
  onChange: (value: string) => void
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={id} help={help} helpAriaLabel={helpAriaLabel}>
        {label}
      </FieldLabel>
      <div className="relative">
        <select
          id={id}
          className="w-full appearance-none px-3 py-2 pr-10 bg-gray-950/60 border border-gray-700 rounded-[8px] text-white [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          value={value}
          onChange={({ target }) => onChange(target.value)}
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
      </div>
    </div>
  )
}

export const settingStackClass =
  'border-t border-gray-700 divide-y divide-gray-700 last:border-b-0 [&>*:nth-child(odd)]:bg-gray-950/60 [&>*:nth-child(even)]:bg-transparent'

export function SettingSwitch({
  checked,
  label,
  onChange
}: {
  checked: boolean
  label: string
  onChange: (next: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors',
        checked ? 'bg-primary-600' : 'bg-gray-600'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform',
          checked && 'translate-x-5'
        )}
      />
    </button>
  )
}

export function SettingCard({
  icon: Icon,
  iconSrc,
  title,
  help,
  helpAriaLabel,
  hint,
  action,
  children,
  variant = 'divider'
}: {
  icon?: LucideIcon
  iconSrc?: string
  title: ReactNode
  help?: string
  helpAriaLabel: string
  hint?: string
  action?: ReactNode
  children?: ReactNode
  variant?: 'card' | 'divider'
}) {
  return (
    <section
      className={cn(
        'space-y-3',
        variant === 'card' ? 'rounded-lg border border-gray-700 bg-gray-800/40 p-3' : 'px-3 py-4'
      )}
    >
      <div className="flex items-start gap-2">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-gray-800 text-gray-300">
          {iconSrc ? (
            <img src={iconSrc} alt="" className="size-4 object-contain" />
          ) : Icon ? (
            <Icon size={16} />
          ) : null}
        </span>
        <div className="min-w-0 flex-1 space-y-0.5">
          <FieldLabel as="h4" help={help} helpAriaLabel={helpAriaLabel}>
            {title}
          </FieldLabel>
          {hint ? <p className="text-xs text-gray-400 leading-relaxed">{hint}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export function ChoiceCard({
  active,
  onClick,
  title,
  hint,
  style
}: {
  active: boolean
  onClick: () => void
  title: string
  hint?: string
  style?: CSSProperties
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      style={style}
      className={cn(
        'rounded-md border px-2 py-2 text-left transition-colors',
        active
          ? 'border-primary-500 bg-primary-600/20 text-white'
          : 'border-gray-700 bg-gray-900/70 text-gray-300 hover:border-gray-500 hover:text-white'
      )}
    >
      <span className="block text-sm font-medium truncate">{title}</span>
      {hint ? (
        <span
          className={cn(
            'block text-[11px] truncate',
            active ? 'text-primary-200' : 'text-gray-400'
          )}
        >
          {hint}
        </span>
      ) : null}
    </button>
  )
}

export function SliderField({
  id,
  label,
  help,
  helpAriaLabel,
  value,
  display,
  min,
  max,
  step = 1,
  minLabel,
  maxLabel,
  onChange
}: {
  id: string
  label: string
  help?: string
  helpAriaLabel: string
  value: number
  display: string
  min: number
  max: number
  step?: number
  minLabel: string
  maxLabel: string
  onChange: (value: number) => void
}) {
  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={id} help={help} helpAriaLabel={helpAriaLabel}>
        {label}
        <span className="ml-1 text-gray-400 font-normal">{display}</span>
      </FieldLabel>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        className="slider h-2 w-full cursor-pointer"
        value={value}
        onChange={({ target }) => onChange(Number(target.value))}
      />
      <div className="flex justify-between text-[11px] text-gray-400">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  )
}

export function ColorField({
  id,
  label,
  help,
  helpAriaLabel,
  color,
  placeholder,
  inputClass,
  onChange
}: {
  id: string
  label?: string
  help?: string
  helpAriaLabel: string
  color: string
  placeholder: string
  inputClass: string
  onChange: (color: string) => void
}) {
  const pickerValue = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color) ? color : '#111827'

  return (
    <div className="space-y-2">
      {label ? (
        <FieldLabel htmlFor={id} help={help} helpAriaLabel={helpAriaLabel}>
          {label}
        </FieldLabel>
      ) : null}
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={pickerValue}
          className="h-10 w-12 cursor-pointer rounded-md border border-gray-700 bg-gray-950/60"
          onChange={({ target }) => onChange(target.value)}
        />
        <input
          className={inputClass}
          id={id}
          type="text"
          value={color}
          placeholder={placeholder}
          onChange={({ target }) => onChange(target.value)}
        />
      </div>
    </div>
  )
}

export function PrimaryAction({
  children,
  disabled,
  onClick,
  className
}: {
  children: ReactNode
  disabled?: boolean
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary-600 px-3 text-sm font-medium text-white transition-colors hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
    >
      {children}
    </button>
  )
}
