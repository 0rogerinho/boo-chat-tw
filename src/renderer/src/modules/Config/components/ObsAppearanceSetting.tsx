import { Layers, Minus, Paintbrush, Plus, Type } from 'lucide-react'
import { getObsFontStack, OBS_FONT_OPTIONS } from '../../../shared/constants/obsFonts'
import type { getConfigI18n } from '../../../shared/i18n'
import type { DisplayAppearance } from '../../../shared/store/useConfigStore'
import { hexToRgba } from '../../../shared/utils/color'
import { FieldLabel } from './FieldLabel'
import { ColorField, PrimaryAction, SelectField, SettingCard, SliderField } from './SettingUi'

const MAX_MESSAGE_COLORS = 6
const EXTRA_COLOR_PALETTE = ['#1e3a5f', '#3f1d2e', '#14532d', '#713f12']
const DEFAULT_LAYER_OPACITY = 55
const FONT_WEIGHTS = [300, 400, 500, 600, 700] as const

type ConfigI18n = ReturnType<typeof getConfigI18n>

export type DisplayAppearanceCopy = {
  title: string
  description: string
  fontFamilyHelp: string
  fontSizeHelp: string
  fontWeightHelp: string
  pageBgTitle: string
  pageBgColorLabel: string
  pageBgColorHelp: string
  pageBgOpacityLabel: string
  pageBgOpacityHelp: string
  messageBgTitle: string
  messageBgHelp: string
}

type ObsAppearanceSettingProps = {
  i18n: ConfigI18n
  appearance: DisplayAppearance
  inputClass: string
  idPrefix: string
  copy: DisplayAppearanceCopy
  onChange: (value: Partial<DisplayAppearance>) => void
}

export function ObsAppearanceSetting({
  i18n,
  appearance,
  inputClass,
  idPrefix,
  copy,
  onChange
}: ObsAppearanceSettingProps) {
  const colors = appearance.messageBackground.colors
  const pageOpacity = appearance.pageBackground.opacity

  const updateFont = (value: Partial<DisplayAppearance['font']>) => {
    onChange({ font: { ...appearance.font, ...value } })
  }

  const updatePageBackground = (value: Partial<DisplayAppearance['pageBackground']>) => {
    onChange({ pageBackground: { ...appearance.pageBackground, ...value } })
  }

  const updateMessageBackground = (value: Partial<DisplayAppearance['messageBackground']>) => {
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
        title={copy.title}
        help={copy.description}
        helpAriaLabel={i18n.helpAriaLabel}
        hint={copy.description}
      >
        <SelectField
          id={`${idPrefix}-font-family`}
          label={i18n.obsFontFamilyLabel}
          help={copy.fontFamilyHelp}
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
          id={`${idPrefix}-font-size`}
          label={i18n.fontSizeLabel}
          help={copy.fontSizeHelp}
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
          id={`${idPrefix}-font-weight`}
          label={i18n.fontWeightLabel}
          help={copy.fontWeightHelp}
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
        title={copy.pageBgTitle}
        help={copy.pageBgColorHelp}
        helpAriaLabel={i18n.helpAriaLabel}
      >
        <ColorField
          id={`${idPrefix}-page-background`}
          label={copy.pageBgColorLabel}
          help={copy.pageBgColorHelp}
          helpAriaLabel={i18n.helpAriaLabel}
          color={appearance.pageBackground.color}
          placeholder={i18n.bgPlaceholder}
          inputClass={inputClass}
          onChange={(color) => updatePageBackground({ color })}
        />
        <SliderField
          id={`${idPrefix}-page-opacity`}
          label={copy.pageBgOpacityLabel}
          help={copy.pageBgOpacityHelp}
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
        title={copy.messageBgTitle}
        help={copy.messageBgHelp}
        helpAriaLabel={i18n.helpAriaLabel}
      >
        <div className="space-y-2">
          {colors.map((layer, index) => (
            <div
              key={`${idPrefix}-message-color-${index}`}
              className="space-y-2 rounded-md border border-gray-700 bg-gray-900/50 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <FieldLabel
                  htmlFor={`${idPrefix}-message-color-${index}`}
                  help={copy.messageBgHelp}
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
                id={`${idPrefix}-message-color-${index}`}
                help={copy.messageBgHelp}
                helpAriaLabel={i18n.helpAriaLabel}
                color={layer.color}
                placeholder={i18n.bgPlaceholder}
                inputClass={inputClass}
                onChange={(color) => setColorAt(index, color)}
              />
              <SliderField
                id={`${idPrefix}-message-opacity-${index}`}
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
