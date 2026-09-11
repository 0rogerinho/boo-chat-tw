import { Paintbrush, Type } from 'lucide-react'
import type { getConfigI18n } from '../../../shared/i18n'
import { ColorField, SelectField, SettingCard, SliderField, settingStackClass } from './SettingUi'

const FONT_WEIGHTS = [300, 400, 500, 600, 700] as const

type ConfigI18n = ReturnType<typeof getConfigI18n>

type AppearanceSettingProps = {
  i18n: ConfigI18n
  inputClass: string
  fontSize: number
  fontWeight: number
  background: string
  opacity: number
  onFontSizeChange: (size: number) => void
  onFontWeightChange: (weight: number) => void
  onBackgroundChange: (color: string) => void
  onOpacityChange: (opacity: number) => void
}

export function AppearanceSetting({
  i18n,
  inputClass,
  fontSize,
  fontWeight,
  background,
  opacity,
  onFontSizeChange,
  onFontWeightChange,
  onBackgroundChange,
  onOpacityChange
}: AppearanceSettingProps) {
  return (
    <div className={settingStackClass}>
      <SettingCard icon={Type} title={i18n.fontTitle} help={i18n.fontSizeHelp} helpAriaLabel={i18n.helpAriaLabel}>
        <SliderField
          id="font-size"
          label={i18n.fontSizeLabel}
          help={i18n.fontSizeHelp}
          helpAriaLabel={i18n.helpAriaLabel}
          value={fontSize}
          display={`${fontSize}px`}
          min={10}
          max={24}
          minLabel="10px"
          maxLabel="24px"
          onChange={onFontSizeChange}
        />

        <SelectField
          id="font-weight"
          label={i18n.fontWeightLabel}
          help={i18n.fontWeightHelp}
          helpAriaLabel={i18n.helpAriaLabel}
          value={String(fontWeight)}
          onChange={(value) => onFontWeightChange(parseInt(value, 10))}
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
        title={i18n.bgTitle}
        help={i18n.bgDescription}
        helpAriaLabel={i18n.helpAriaLabel}
      >
        <ColorField
          id="background-color"
          label={i18n.bgColorLabel}
          help={i18n.bgDescription}
          helpAriaLabel={i18n.helpAriaLabel}
          color={background}
          placeholder={i18n.bgPlaceholder}
          inputClass={inputClass}
          onChange={onBackgroundChange}
        />
        <SliderField
          id="bg-opacity"
          label={i18n.bgOpacityLabel}
          help={i18n.bgOpacityHelp}
          helpAriaLabel={i18n.helpAriaLabel}
          value={opacity}
          display={`${opacity}%`}
          min={0}
          max={100}
          minLabel={i18n.mutedLabel}
          maxLabel={i18n.maxLabel}
          onChange={onOpacityChange}
        />
      </SettingCard>
    </div>
  )
}
