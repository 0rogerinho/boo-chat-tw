import { Minus, Plus } from 'lucide-react'
import { getObsFontStack, OBS_FONT_OPTIONS } from '../../../shared/constants/obsFonts'
import type { getConfigI18n } from '../../../shared/i18n'
import type { TConfigDataProps } from '../../../shared/store/useConfigStore'
import { hexToRgba } from '../../../shared/utils/color'
import { FieldLabel } from './FieldLabel'

const MAX_MESSAGE_COLORS = 6
const EXTRA_COLOR_PALETTE = ['#1e3a5f', '#3f1d2e', '#14532d', '#713f12']
const DEFAULT_LAYER_OPACITY = 55

type ConfigI18n = ReturnType<typeof getConfigI18n>
type ObsAppearance = TConfigDataProps['obsAppearance']

type ObsAppearanceSettingProps = {
  i18n: ConfigI18n
  appearance: ObsAppearance
  inputClass: string
  onChange: (value: Partial<ObsAppearance>) => void
}

function fontWeightName(weight: number | undefined, labels: Record<number, string>): string {
  return labels[weight ?? 400] ?? labels[400]
}

export function ObsAppearanceSetting({
  i18n,
  appearance,
  inputClass,
  onChange
}: ObsAppearanceSettingProps) {
  const colors = appearance.messageBackground.colors
  const pageOpacity = appearance.pageBackground.opacity

  const updateFont = (value: Partial<ObsAppearance['font']>) => {
    onChange({ font: { ...appearance.font, ...value } })
  }

  const updatePageBackground = (value: Partial<ObsAppearance['pageBackground']>) => {
    onChange({ pageBackground: { ...appearance.pageBackground, ...value } })
  }

  const updateMessageBackground = (value: Partial<ObsAppearance['messageBackground']>) => {
    onChange({ messageBackground: { ...appearance.messageBackground, ...value } })
  }

  const setColorAt = (index: number, color: string) => {
    const next = [...colors]
    next[index] = { ...next[index], color }
    updateMessageBackground({ colors: next })
  }

  const setOpacityAt = (index: number, opacity: number) => {
    const next = [...colors]
    next[index] = { ...next[index], opacity }
    updateMessageBackground({ colors: next })
  }

  const addColor = () => {
    if (colors.length >= MAX_MESSAGE_COLORS) return
    const used = new Set(colors.map((layer) => layer.color))
    const nextColor = EXTRA_COLOR_PALETTE.find((color) => !used.has(color)) ?? '#4b5563'
    updateMessageBackground({
      colors: [...colors, { color: nextColor, opacity: DEFAULT_LAYER_OPACITY }]
    })
  }

  const removeColor = (index: number) => {
    if (colors.length <= 1) return
    updateMessageBackground({ colors: colors.filter((_, colorIndex) => colorIndex !== index) })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h4 className="text-white font-medium text-sm">{i18n.obsAppearanceTitle}</h4>
        <p className="text-xs text-gray-400 leading-relaxed">{i18n.obsAppearanceDescription}</p>
      </div>

      <div className="space-y-4">
        <h4 className="text-white font-medium text-sm">{i18n.fontTitle}</h4>

        <div className="space-y-2">
          <FieldLabel
            htmlFor="obs-font-family"
            help={i18n.obsFontFamilyHelp}
            helpAriaLabel={i18n.helpAriaLabel}
          >
            {i18n.obsFontFamilyLabel}
          </FieldLabel>
          <select
            id="obs-font-family"
            className={inputClass}
            value={appearance.font.family}
            onChange={({ target }) => updateFont({ family: target.value })}
          >
            {OBS_FONT_OPTIONS.map((font) => (
              <option key={font.id} value={font.id} style={{ fontFamily: font.stack }}>
                {font.id}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col space-y-2">
          <FieldLabel
            htmlFor="obs-font-size"
            help={i18n.obsFontSizeHelp}
            helpAriaLabel={i18n.helpAriaLabel}
          >
            {i18n.fontSizeLabel}: {appearance.font.size}px
          </FieldLabel>
          <input
            className="h-2 bg-red-700 rounded-lg appearance-none cursor-pointer slider"
            id="obs-font-size"
            type="range"
            min="10"
            max="36"
            value={appearance.font.size}
            onChange={({ target }) => updateFont({ size: parseInt(target.value, 10) })}
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>10px</span>
            <span>36px</span>
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel
            htmlFor="obs-font-weight"
            help={i18n.obsFontWeightHelp}
            helpAriaLabel={i18n.helpAriaLabel}
          >
            {i18n.fontWeightLabel}: {fontWeightName(appearance.font.weight, i18n.fontWeights)}
          </FieldLabel>
          <select
            className={inputClass}
            id="obs-font-weight"
            value={appearance.font.weight}
            onChange={({ target }) => updateFont({ weight: parseInt(target.value, 10) })}
          >
            <option value={300}>{i18n.fontWeights[300]} (300)</option>
            <option value={400}>{i18n.fontWeights[400]} (400)</option>
            <option value={500}>{i18n.fontWeights[500]} (500)</option>
            <option value={600}>{i18n.fontWeights[600]} (600)</option>
            <option value={700}>{i18n.fontWeights[700]} (700)</option>
          </select>
        </div>
      </div>

      <hr className="border-gray-700" />

      <div className="space-y-4">
        <h4 className="text-white font-medium text-sm">{i18n.obsPageBgTitle}</h4>

        <div className="space-y-2">
          <FieldLabel
            htmlFor="obs-page-background"
            help={i18n.obsPageBgColorHelp}
            helpAriaLabel={i18n.helpAriaLabel}
          >
            {i18n.obsPageBgColorLabel}
          </FieldLabel>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={appearance.pageBackground.color}
              className="w-12 h-10 rounded-md"
              onChange={({ target }) => updatePageBackground({ color: target.value })}
            />
            <input
              className={inputClass}
              id="obs-page-background"
              type="text"
              value={appearance.pageBackground.color}
              placeholder={i18n.bgPlaceholder}
              onChange={({ target }) => updatePageBackground({ color: target.value })}
            />
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <FieldLabel
            htmlFor="obs-page-opacity"
            help={i18n.obsPageBgOpacityHelp}
            helpAriaLabel={i18n.helpAriaLabel}
          >
            {i18n.obsPageBgOpacityLabel}: {pageOpacity}%
          </FieldLabel>
          <input
            className="h-2 bg-red-700 rounded-lg appearance-none cursor-pointer slider"
            id="obs-page-opacity"
            type="range"
            min={0}
            max={100}
            value={pageOpacity}
            onChange={({ target }) =>
              updatePageBackground({ opacity: parseInt(target.value, 10) })
            }
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>{i18n.mutedLabel}</span>
            <span>{i18n.maxLabel}</span>
          </div>
        </div>
      </div>

      <hr className="border-gray-700" />

      <div className="space-y-4">
        <FieldLabel as="h4" help={i18n.obsMessageBgHelp} helpAriaLabel={i18n.helpAriaLabel}>
          {i18n.obsMessageBgTitle}
        </FieldLabel>

        <div className="space-y-3">
          {colors.map((layer, index) => (
            <div
              key={`obs-message-color-${index}`}
              className="space-y-2 rounded-lg border border-gray-700 bg-gray-800/40 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <FieldLabel
                  htmlFor={`obs-message-color-${index}`}
                  help={i18n.obsMessageBgHelp}
                  helpAriaLabel={i18n.helpAriaLabel}
                >
                  {i18n.obsMessageColorLabel.replace('{n}', String(index + 1))}
                </FieldLabel>
                {colors.length > 1 && (
                  <button
                    type="button"
                    className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs text-gray-300 hover:bg-gray-800 hover:text-white"
                    onClick={() => removeColor(index)}
                    aria-label={`${i18n.obsRemoveColorAria} ${index + 1}`}
                  >
                    <Minus size={12} />
                    {i18n.obsRemoveColor}
                  </button>
                )}
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={layer.color}
                  className="w-12 h-10 rounded-md"
                  onChange={({ target }) => setColorAt(index, target.value)}
                />
                <input
                  className={inputClass}
                  id={`obs-message-color-${index}`}
                  type="text"
                  value={layer.color}
                  placeholder={i18n.bgPlaceholder}
                  onChange={({ target }) => setColorAt(index, target.value)}
                />
              </div>
              <div className="flex flex-col space-y-2">
                <FieldLabel
                  htmlFor={`obs-message-opacity-${index}`}
                  help={i18n.obsMessageBgOpacityHelp}
                  helpAriaLabel={i18n.helpAriaLabel}
                >
                  {i18n.obsMessageBgOpacityLabel}: {layer.opacity}%
                </FieldLabel>
                <input
                  className="h-2 bg-red-700 rounded-lg appearance-none cursor-pointer slider"
                  id={`obs-message-opacity-${index}`}
                  type="range"
                  min={0}
                  max={100}
                  value={layer.opacity}
                  onChange={({ target }) =>
                    setOpacityAt(index, parseInt(target.value, 10))
                  }
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{i18n.mutedLabel}</span>
                  <span>{i18n.maxLabel}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {colors.length < MAX_MESSAGE_COLORS && (
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-gray-800 px-2.5 text-xs font-medium text-gray-200 hover:bg-gray-700 hover:text-white"
            onClick={addColor}
          >
            <Plus size={12} />
            {i18n.obsAddColor}
          </button>
        )}

        <div className="space-y-2">
          <p className="text-xs text-gray-400">{i18n.obsPreviewTitle}</p>
          <div
            className="rounded-md border border-gray-700 overflow-hidden"
            style={{
              backgroundColor:
                hexToRgba(appearance.pageBackground.color, pageOpacity) ?? 'transparent'
            }}
          >
            {Array.from({ length: Math.max(4, colors.length * 2) }, (_, index) => {
              const layer = colors[index % colors.length]
              return (
                <div
                  key={`preview-${index}`}
                  className="w-full px-3 py-1"
                  style={{
                    backgroundColor: hexToRgba(layer.color, layer.opacity),
                    fontFamily: getObsFontStack(appearance.font.family),
                    fontSize: `${appearance.font.size}px`,
                    fontWeight: appearance.font.weight
                  }}
                >
                  <span className="text-sky-300 mr-1">
                    {i18n.obsPreviewUser}
                    {index + 1}:
                  </span>
                  <span className="text-white">{i18n.obsPreviewMessage}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
