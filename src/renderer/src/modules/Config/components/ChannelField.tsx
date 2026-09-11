import { FieldLabel } from './FieldLabel'

type ChannelFieldProps = {
  id: string
  iconSrc: string
  title: string
  help: string
  helpAriaLabel: string
  value: string
  placeholder: string
  iconClassName?: string
  onChange: (value: string) => void
}

export function ChannelField({
  id,
  iconSrc,
  title,
  help,
  helpAriaLabel,
  value,
  placeholder,
  iconClassName = 'size-4',
  onChange
}: ChannelFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-gray-800 text-gray-300">
          <img src={iconSrc} alt="" className={`${iconClassName} object-contain`} />
        </span>
        <FieldLabel htmlFor={id} help={help} helpAriaLabel={helpAriaLabel}>
          {title}
        </FieldLabel>
      </div>
      <input
        className="w-full px-3 py-2 bg-gray-950/60 border border-gray-700 rounded-[8px] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={({ target }) => onChange(target.value)}
      />
    </div>
  )
}
