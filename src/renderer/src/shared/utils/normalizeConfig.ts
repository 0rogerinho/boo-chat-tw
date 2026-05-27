import { DEFAULT_CONFIG_DATA } from '../constants/defaultConfig'
import { parseMessageSound } from '../constants/messageSounds'
import { normalizeLanguage } from '../i18n'
import type { TConfigDataProps } from '../store/useConfigStore'

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
      )
    },
    background: {
      ...DEFAULT_CONFIG_DATA.background,
      ...merged.background,
      opacity: clampBackgroundOpacity(
        merged.background?.opacity,
        DEFAULT_CONFIG_DATA.background.opacity
      )
    }
  }
}
