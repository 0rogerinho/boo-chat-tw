import { Layers, Minus, Paintbrush, Plus, Type } from 'lucide-react'
import { getObsFontStack, OBS_FONT_OPTIONS } from '../../../shared/constants/obsFonts'
import type { getConfigI18n } from '../../../shared/i18n'
import type { TConfigDataProps } from '../../../shared/store/useConfigStore'
import { hexToRgba } from '../../../shared/utils/color'
import { FieldLabel } from './FieldLabel'
import { ColorField, PrimaryAction, SelectField, SettingCard, SliderField } from './SettingUi'

const MAX_MESSAGE_COLORS = 6
const EXTRA_COLOR_PALETTE = ['#1e3a5f', '#3f1d2e', '#14532d', '#713f12']
const DEFAULT_LAYER_OPACITY = 55
const FONT_WEIGHTS = [300, 400, 500, 600, 700] as const

type ConfigI18n = ReturnType<typeof getConfigI18n>
type ObsAppearance = TConfigDataProps['obsAppearance']

type ObsAppearanceSettingProps = {
  i18n: ConfigI18n
  appearance: ObsAppearance
  inputClass: string
  onChange: (value: Partial<ObsAppearance>) => void
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
    <>
      <SettingCard
        icon={Type}
        title={i18n.obsAppearanceTitle}
        help={i18n.obsAppearanceDescription}
        helpAriaLabel={i18n.helpAriaLabel}
        hint={i18n.obsAppearanceDescription}
      >
        <SelectField
          id="obs-font-family"
          label={i18n.obsFontFamilyLabel}
          help={i18n.obsFontFamilyHelp}
          helpAriaLabel={i18n.helpAriaLabel}
          value={appearance.font.family}
          onChange={(family) => updateFont({ family })}
        >
          {OBS_FONT_OPTIONS.map((font) => (
            <option key={font.id} value={font.id} style={{ fontFamily: font.stack }}>
              {font.id}
            </option>
          ))}
        </SelectField>

        <SliderField
          id="obs-font-size"
          label={i18n.fontSizeLabel}
          help={i18n.obsFontSizeHelp}
          helpAriaLabel={i18n.helpAriaLabel}
          value={appearance.font.size}
          display={`${appearance.font.size}px`}
          min={10}
          max={36}
          minLabel="10px"
          maxLabel="36px"
          onChange={(size) => updateFont({ size })}
        />

        <SelectField
          id="obs-font-weight"
          label={i18n.fontWeightLabel}
          help={i18n.obsFontWeightHelp}
          helpAriaLabel={i18n.helpAriaLabel}
          value={String(appearance.font.weight)}
          onChange={(weight) => updateFont({ weight: parseInt(weight, 10) })}
        >
          {FONT_WEIGHTS.map((weight) => (
            <option key={weight} value={weight}>
              {i18n.fontWeights[weight]} ({weight})
            </option>
          ))}
        </SelectField>
      </SettingCard>

      <SettingCard
        icon={Paintbrush}
        title={i18n.obsPageBgTitle}
        help={i18n.obsPageBgColorHelp}
        helpAriaLabel={i18n.helpAriaLabel}
      >
        <ColorField
          id="obs-page-background"
          label={i18n.obsPageBgColorLabel}
          help={i18n.obsPageBgColorHelp}
          helpAriaLabel={i18n.helpAriaLabel}
          color={appearance.pageBackground.color}
          placeholder={i18n.bgPlaceholder}
          inputClass={inputClass}
          onChange={(color) => updatePageBackground({ color })}
        />
        <SliderField
          id="obs-page-opacity"
          label={i18n.obsPageBgOpacityLabel}
          help={i18n.obsPageBgOpacityHelp}
          helpAriaLabel={i18n.helpAriaLabel}
          value={pageOpacity}
          display={`${pageOpacity}%`}
          min={0}
          max={100}
          minLabel={i18n.mutedLabel}
          maxLabel={i18n.maxLabel}
          onChange={(opacity) => updatePageBackground({ opacity })}
        />
      </SettingCard>

      <SettingCard
        icon={Layers}
        title={i18n.obsMessageBgTitle}
        help={i18n.obsMessageBgHelp}
        helpAriaLabel={i18n.helpAriaLabel}
      >
        <div className="space-y-2">
          {colors.map((layer, index) => (
            <div
              key={`obs-message-color-${index}`}
              className="space-y-2 rounded-md border border-gray-700 bg-gray-900/50 p-3"
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
              <ColorField
                id={`obs-message-color-${index}`}
                help={i18n.obsMessageBgHelp}
                helpAriaLabel={i18n.helpAriaLabel}
                color={layer.color}
                placeholder={i18n.bgPlaceholder}
                inputClass={inputClass}
                onChange={(color) => setColorAt(index, color)}
              />
              <SliderField
                id={`obs-message-opacity-${index}`}
                label={i18n.obsMessageBgOpacityLabel}
                help={i18n.obsMessageBgOpacityHelp}
                helpAriaLabel={i18n.helpAriaLabel}
                value={layer.opacity}
                display={`${layer.opacity}%`}
                min={0}
                max={100}
                minLabel={i18n.mutedLabel}
                maxLabel={i18n.maxLabel}
                onChange={(opacity) => setOpacityAt(index, opacity)}
              />
            </div>
          ))}
        </div>

        {colors.length < MAX_MESSAGE_COLORS && (
          <PrimaryAction onClick={addColor}>
            <Plus size={12} />
            {i18n.obsAddColor}
          </PrimaryAction>
        )}

        <div className="space-y-2">
          <p className="text-xs text-gray-400">{i18n.obsPreviewTitle}</p>
          <div
            className="overflow-hidden rounded-md border border-gray-700"
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
                  <span className="mr-1 text-sky-300">
                    {i18n.obsPreviewUser}
                    {index + 1}:
                  </span>
                  <span className="text-white">{i18n.obsPreviewMessage}</span>
                </div>
              )
            })}
          </div>
        </div>
      </SettingCard>
    </>
  )
}
