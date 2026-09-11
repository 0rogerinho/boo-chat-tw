import type { LucideIcon } from 'lucide-react'
import { Filter, Globe, MonitorPlay, Palette, Radio } from 'lucide-react'
import { cn } from '../../../shared/lib/cn'
import type { getConfigI18n } from '../../../shared/i18n'

export type ConfigSection = 'general' | 'channels' | 'appearance' | 'obs' | 'filters'

type SidebarI18n = ReturnType<typeof getConfigI18n>

type SidebarLabelKey =
  | 'sidebarGeneral'
  | 'sidebarChannels'
  | 'sidebarAppearance'
  | 'sidebarObs'
  | 'sidebarFilters'

const SECTIONS: { id: ConfigSection; icon: LucideIcon; labelKey: SidebarLabelKey }[] = [
  { id: 'general', icon: Globe, labelKey: 'sidebarGeneral' },
  { id: 'channels', icon: Radio, labelKey: 'sidebarChannels' },
  { id: 'appearance', icon: Palette, labelKey: 'sidebarAppearance' },
  { id: 'obs', icon: MonitorPlay, labelKey: 'sidebarObs' },
  { id: 'filters', icon: Filter, labelKey: 'sidebarFilters' }
]

type SidebarProps = {
  section: ConfigSection
  onSelect: (section: ConfigSection) => void
  i18n: SidebarI18n
}

export default function Sidebar({ section, onSelect, i18n }: SidebarProps) {
  return (
    <aside className="w-44 shrink-0 border-r border-gray-700 bg-gray-950/60 py-3 px-2 overflow-y-auto scroll">
      <nav className="flex flex-col gap-1" aria-label="Configurações">
        {SECTIONS.map(({ id, icon: Icon, labelKey }) => {
          const isActive = section === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              className={cn(
                'flex items-center gap-2 w-full px-2.5 py-2 rounded-md text-left text-sm transition-colors',
                isActive
                  ? 'bg-primary-600/90 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon size={16} className="shrink-0" />
              <span className="truncate">{i18n[labelKey]}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
