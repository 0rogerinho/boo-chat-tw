import { ReactNode, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CircleHelp } from 'lucide-react'
import { cn } from '../../../shared/lib'

const TOOLTIP_WIDTH = 280
const VIEWPORT_PADDING = 8
const GAP = 8

type HelpTooltipProps = {
  text: string
  ariaLabel: string
}

function HelpTooltip({ text, ariaLabel }: HelpTooltipProps) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const hideTimerRef = useRef<number>()
  const tooltipId = useId()
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, placeBelow: true })

  const updatePosition = () => {
    const trigger = triggerRef.current
    if (!trigger) return

    const rect = trigger.getBoundingClientRect()
    const tooltipHeight = tooltipRef.current?.offsetHeight ?? 96
    const spaceBelow = window.innerHeight - rect.bottom - GAP - VIEWPORT_PADDING
    const placeBelow =
      spaceBelow >= tooltipHeight || rect.top < tooltipHeight + GAP + VIEWPORT_PADDING

    const half = TOOLTIP_WIDTH / 2
    const left = Math.min(
      Math.max(rect.left + rect.width / 2, half + VIEWPORT_PADDING),
      window.innerWidth - half - VIEWPORT_PADDING
    )
    const top = placeBelow ? rect.bottom + GAP : rect.top - GAP

    setCoords({ top, left, placeBelow })
  }

  const show = () => {
    window.clearTimeout(hideTimerRef.current)
    const trigger = triggerRef.current
    if (trigger) {
      const rect = trigger.getBoundingClientRect()
      const half = TOOLTIP_WIDTH / 2
      const left = Math.min(
        Math.max(rect.left + rect.width / 2, half + VIEWPORT_PADDING),
        window.innerWidth - half - VIEWPORT_PADDING
      )
      const placeBelow = rect.top < 120
      setCoords({
        top: placeBelow ? rect.bottom + GAP : rect.top - GAP,
        left,
        placeBelow
      })
    }
    setOpen(true)
  }

  const hide = () => {
    hideTimerRef.current = window.setTimeout(() => setOpen(false), 100)
  }

  useLayoutEffect(() => {
    if (!open) return
    updatePosition()
  }, [open, text])

  useEffect(() => {
    if (!open) return

    const onReposition = () => updatePosition()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('scroll', onReposition, true)
    window.addEventListener('resize', onReposition)
    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('scroll', onReposition, true)
      window.removeEventListener('resize', onReposition)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, text])

  useEffect(() => {
    return () => window.clearTimeout(hideTimerRef.current)
  }, [])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors cursor-help hover:text-primary-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:text-primary-400"
        aria-label={ariaLabel}
        aria-describedby={open ? tooltipId : undefined}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        <CircleHelp size={14} strokeWidth={2} />
      </button>
      {open
        ? createPortal(
            <div
              ref={tooltipRef}
              id={tooltipId}
              role="tooltip"
              className={cn(
                'fixed z-[200] w-[280px] -translate-x-1/2 pointer-events-none',
                coords.placeBelow ? '' : '-translate-y-full'
              )}
              style={{ top: coords.top, left: coords.left }}
            >
              <div className="rounded-md border border-gray-600 bg-gray-800 px-2.5 py-2 text-xs leading-relaxed text-gray-100 shadow-xl whitespace-pre-wrap">
                {text}
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  )
}

type FieldLabelProps = {
  htmlFor?: string
  as?: 'label' | 'h3' | 'h4' | 'span'
  children: ReactNode
  help?: string
  helpAriaLabel: string
  className?: string
  textClassName?: string
}

export function FieldLabel({
  htmlFor,
  as = 'label',
  children,
  help,
  helpAriaLabel,
  className,
  textClassName
}: FieldLabelProps) {
  const textClasses = cn(
    'text-white font-medium min-w-0',
    as === 'h3' ? 'text-lg' : 'text-sm',
    textClassName
  )

  return (
    <div className={cn('flex items-center gap-1.5 min-w-0', className)}>
      {as === 'label' ? (
        <label htmlFor={htmlFor} className={textClasses}>
          {children}
        </label>
      ) : as === 'h3' ? (
        <h3 className={textClasses}>{children}</h3>
      ) : as === 'h4' ? (
        <h4 className={textClasses}>{children}</h4>
      ) : (
        <span className={textClasses}>{children}</span>
      )}
      {help ? <HelpTooltip text={help} ariaLabel={helpAriaLabel} /> : null}
    </div>
  )
}
