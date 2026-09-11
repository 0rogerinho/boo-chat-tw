export const OBS_FONT_OPTIONS = [
  { id: 'Open Sans', stack: '"Open sans", "Open Sans", Arial, sans-serif' },
  { id: 'Arial', stack: 'Arial, Helvetica, sans-serif' },
  { id: 'Verdana', stack: 'Verdana, Geneva, sans-serif' },
  { id: 'Tahoma', stack: 'Tahoma, Geneva, sans-serif' },
  { id: 'Trebuchet MS', stack: '"Trebuchet MS", Helvetica, sans-serif' },
  { id: 'Georgia', stack: 'Georgia, "Times New Roman", serif' },
  { id: 'Times New Roman', stack: '"Times New Roman", Times, serif' },
  { id: 'Courier New', stack: '"Courier New", Courier, monospace' },
  { id: 'Comic Sans MS', stack: '"Comic Sans MS", "Comic Sans", cursive' },
  { id: 'Impact', stack: 'Impact, Haettenschweiler, sans-serif' }
] as const

export type ObsFontFamily = (typeof OBS_FONT_OPTIONS)[number]['id']

const FONT_IDS = new Set<string>(OBS_FONT_OPTIONS.map((font) => font.id))

export function parseObsFontFamily(value: unknown): ObsFontFamily {
  if (typeof value === 'string' && FONT_IDS.has(value)) {
    return value as ObsFontFamily
  }
  return 'Open Sans'
}

export function getObsFontStack(family: unknown): string {
  const id = parseObsFontFamily(family)
  return OBS_FONT_OPTIONS.find((font) => font.id === id)?.stack ?? OBS_FONT_OPTIONS[0].stack
}
