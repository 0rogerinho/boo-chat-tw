export function hexToRgba(hexColor: string | undefined, opacityPercent: number): string | undefined {
  if (!hexColor) return undefined

  const hex = hexColor.trim().replace('#', '')
  const normalizedHex = hex.length === 3 ? hex.split('').map((char) => char + char).join('') : hex

  if (!/^[a-fA-F0-9]{6}$/.test(normalizedHex)) return hexColor

  const red = parseInt(normalizedHex.slice(0, 2), 16)
  const green = parseInt(normalizedHex.slice(2, 4), 16)
  const blue = parseInt(normalizedHex.slice(4, 6), 16)
  const alpha = Math.min(1, Math.max(0, opacityPercent / 100))

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

const NAMED_CSS_COLOR = /^[a-z]{1,20}$/i
const HEX_CSS_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i

export function safeCssColor(value: string | undefined, fallback: string): string {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  if (HEX_CSS_COLOR.test(trimmed) || NAMED_CSS_COLOR.test(trimmed)) return trimmed
  return fallback
}

export function normalizeHexColor(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback

  const trimmed = value.trim()
  if (!trimmed) return fallback

  const hex = trimmed.startsWith('#') ? trimmed : `#${trimmed}`
  const body = hex.slice(1)

  if (/^[a-fA-F0-9]{3}$/.test(body) || /^[a-fA-F0-9]{6}$/.test(body)) {
    return hex
  }

  return fallback
}
