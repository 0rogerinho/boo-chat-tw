import { DEFAULT_CONFIG_DATA } from '../constants/defaultConfig'
import { parseMessageSound } from '../constants/messageSounds'
import { parseObsFontFamily } from '../constants/obsFonts'
import { normalizeLanguage } from '../i18n'
import type { DisplayAppearance, TConfigDataProps } from '../store/useConfigStore'
import { normalizeHexColor } from './color'
import { parseTtsVoice } from '../constants/ttsVoices'
import { parseTtsEnabled, parseTtsRate, parseTtsReadAuthor, parseTtsVolume } from './messageTts'

function clampMessageSoundVolume(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? parseFloat(value) : NaN
  if (!Number.isFinite(n)) return fallback
  return Math.min(100, Math.max(0, Math.round(n)))
}

function clampBackgroundOpacity(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? parseFloat(value) : NaN
  if (!Number.isFinite(n)) return fallback
  return Math.min(100, Math.max(0, Math.round(n)))
}

function clampHideAfterSeconds(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? parseFloat(value) : NaN
  if (!Number.isFinite(n)) return fallback
  return Math.min(300, Math.max(1, Math.round(n)))
}

function clampFontSize(value: unknown, fallback: number, max = 24): number {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? parseFloat(value) : NaN
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(10, Math.round(n)))
}

function clampFontWeight(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? parseFloat(value) : NaN
  if (!Number.isFinite(n)) return fallback
  const allowed = [300, 400, 500, 600, 700]
  return allowed.includes(n) ? n : fallback
}

function normalizeMessageColors(
  value: unknown,
  fallbackOpacity: number,
  defaults: Array<{ color: string; opacity: number }>
): Array<{ color: string; opacity: number }> {
  if (!Array.isArray(value) || value.length === 0) {
    return defaults.map((entry) => ({ ...entry }))
  }

  const colors = value
    .map((entry) => {
      if (typeof entry === 'string') {
        const color = normalizeHexColor(entry, '')
        return color ? { color, opacity: clampBackgroundOpacity(fallbackOpacity, 55) } : null
      }

      if (entry && typeof entry === 'object') {
        const color = normalizeHexColor((entry as { color?: unknown }).color, '')
        if (!color) return null
        return {
          color,
          opacity: clampBackgroundOpacity((entry as { opacity?: unknown }).opacity, fallbackOpacity)
        }
      }

      return null
    })
    .filter((entry): entry is { color: string; opacity: number } => entry !== null)
    .slice(0, 6)

  return colors.length > 0 ? colors : defaults.map((entry) => ({ ...entry }))
}

function normalizeDisplayAppearance(
  value: DisplayAppearance | undefined,
  fallback: DisplayAppearance
): DisplayAppearance {
  return {
    font: {
      family: parseObsFontFamily(value?.font?.family ?? fallback.font.family),
      size: clampFontSize(value?.font?.size, fallback.font.size, 36),
      weight: clampFontWeight(value?.font?.weight, fallback.font.weight)
    },
    pageBackground: {
      color: normalizeHexColor(value?.pageBackground?.color, fallback.pageBackground.color),
      opacity: clampBackgroundOpacity(value?.pageBackground?.opacity, fallback.pageBackground.opacity)
    },
    messageBackground: {
      colors: normalizeMessageColors(
        value?.messageBackground?.colors,
        clampBackgroundOpacity(
          (value?.messageBackground as { opacity?: unknown } | undefined)?.opacity,
          55
        ),
        fallback.messageBackground.colors
      )
    }
  }
}

/** Garante defaults (incl. notificações) ao carregar JSON antigo ou incompleto */
export function normalizeStoredConfig(
  partial: Partial<TConfigDataProps> | undefined | null
): TConfigDataProps {
  const merged = { ...DEFAULT_CONFIG_DATA, ...partial } as TConfigDataProps
  return {
    ...merged,
    language: normalizeLanguage(merged.language),
    notifications: {
      ...DEFAULT_CONFIG_DATA.notifications,
      ...merged.notifications,
      messageSound: parseMessageSound(merged.notifications?.messageSound),
      messageSoundVolume: clampMessageSoundVolume(
        merged.notifications?.messageSoundVolume,
        DEFAULT_CONFIG_DATA.notifications.messageSoundVolume
      ),
      ttsEnabled: parseTtsEnabled(merged.notifications?.ttsEnabled),
      ttsVolume: parseTtsVolume(
        merged.notifications?.ttsVolume,
        DEFAULT_CONFIG_DATA.notifications.ttsVolume
      ),
      ttsRate: parseTtsRate(
        merged.notifications?.ttsRate,
        DEFAULT_CONFIG_DATA.notifications.ttsRate
      ),
      ttsReadAuthor: parseTtsReadAuthor(merged.notifications?.ttsReadAuthor),
      ttsVoice: parseTtsVoice(merged.notifications?.ttsVoice)
    },
    background: {
      ...DEFAULT_CONFIG_DATA.background,
      ...merged.background,
      opacity: clampBackgroundOpacity(
        merged.background?.opacity,
        DEFAULT_CONFIG_DATA.background.opacity
      )
    },
    obsAppearance: normalizeDisplayAppearance(
      merged.obsAppearance,
      DEFAULT_CONFIG_DATA.obsAppearance
    ),
    liveAppearance: normalizeDisplayAppearance(
      merged.liveAppearance,
      DEFAULT_CONFIG_DATA.liveAppearance
    ),
    messageVisibility: {
      ...DEFAULT_CONFIG_DATA.messageVisibility,
      ...merged.messageVisibility,
      systemAlwaysVisible: merged.messageVisibility?.systemAlwaysVisible !== false,
      viewersAlwaysVisible: merged.messageVisibility?.viewersAlwaysVisible !== false,
      systemHideAfterSeconds: clampHideAfterSeconds(
        merged.messageVisibility?.systemHideAfterSeconds,
        DEFAULT_CONFIG_DATA.messageVisibility.systemHideAfterSeconds
      ),
      viewersHideAfterSeconds: clampHideAfterSeconds(
        merged.messageVisibility?.viewersHideAfterSeconds,
        DEFAULT_CONFIG_DATA.messageVisibility.viewersHideAfterSeconds
      )
    },
    emotes: {
      ...DEFAULT_CONFIG_DATA.emotes,
      ...merged.emotes,
      seventv: merged.emotes?.seventv !== false,
      betterttv: merged.emotes?.betterttv !== false
    },
    media: {
      ...DEFAULT_CONFIG_DATA.media,
      ...merged.media,
      linkImages: merged.media?.linkImages === true
    },
    appearance: {
      ...DEFAULT_CONFIG_DATA.appearance,
      ...merged.appearance,
      platformColorDot: merged.appearance?.platformColorDot === true
    }
  }
}
