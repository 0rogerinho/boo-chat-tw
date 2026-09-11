import { useState } from 'react'
import { IoClose } from 'react-icons/io5'
import { CgBorderStyleSolid } from 'react-icons/cg'
import { FaEyeSlash } from 'react-icons/fa6'
import { IoMdSettings } from 'react-icons/io'
import { Link2 } from 'lucide-react'
import useHeader from '../hooks/useHeader'
import { VscExpandAll } from 'react-icons/vsc'
import { cn } from '../../../shared/lib/cn'
import { getConfigI18n } from '../../../shared/i18n'
import { useConfigStore } from '../../../shared/store/useConfigStore'

export const Header = () => {
  const { showWindow, fullScreen, setFullScreen, handleShowWindow, openConfigWindow } = useHeader()
  const { config } = useConfigStore()
  const i18n = getConfigI18n(config?.language)
  const [copied, setCopied] = useState(false)

  const copyOverlayUrl = async () => {
    try {
      const response = await window.electron.ipcRenderer.invoke('get-overlay-url')
      const url = response?.url as string | undefined
      if (!url) return

      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar link do OBS:', error)
    }
  }

  return (
    <header
      className={cn(
        'fixed w-full bg-gray-900/95 backdrop-blur-sm move-page flex justify-between items-center rounded-t-md overflow-hidden transition-all duration-300 opacity-100 visible border-b border-gray-600',
        !showWindow && 'opacity-0 bg-transparent border-transparent'
      )}
    >
      <div className={cn('flex items-center')}>
        {/* Settings */}
        <button
          className="flex size-8 min-w-[32px] items-center justify-center group no-move hover:bg-gray-800/80 transition-all duration-200 rounded-sm"
          onClick={() => openConfigWindow()}
        >
          <IoMdSettings
            className="m-auto text-gray-300 group-hover:text-white transition-all duration-200"
            size={16}
          />
        </button>

        <button
          className="flex size-8 min-w-[32px] items-center justify-center group no-move hover:bg-gray-800/80 transition-all duration-200 rounded-sm"
          onClick={copyOverlayUrl}
          title={copied ? i18n.obsCopied : i18n.obsCopyAria}
        >
          <Link2
            className="m-auto text-gray-300 group-hover:text-white transition-all duration-200"
            size={16}
          />
        </button>

        {/* Hide/Show */}
        <button
          className="flex size-8 min-w-[32px] items-center justify-center group no-move hover:bg-gray-800/80 transition-all duration-200 rounded-sm"
          onClick={handleShowWindow}
        >
          <FaEyeSlash
            className="m-auto text-gray-300 group-hover:text-white transition-all duration-200"
            size={16}
          />
        </button>
      </div>

      <div className="flex h-full">
        <button
          className="flex w-8 max-w-[32px] min-h-[32px] h-full justify-center items-center hover:bg-gray-800/80 no-move px-0.5 cursor-default group transition-all duration-200 "
          onClick={() => window.electron.ipcRenderer.send('closeFilePreview')}
        >
          <CgBorderStyleSolid className="m-auto text-gray-300 group-hover:text-white" size={14} />
        </button>

        <button
          className="flex w-8 max-w-[32px] min-h-[32px] h-full justify-center items-center no-move px-0.5 cursor-default group transition-all duration-200 hover:bg-primary-600/80"
          onClick={() => {
            window.electron.ipcRenderer.send('setFullScreen', !fullScreen),
              setFullScreen(!fullScreen)
          }}
        >
          <VscExpandAll className="m-auto text-gray-300 group-hover:text-white" size={14} />
        </button>

        <button
          className="flex w-8 max-w-[32px] min-h-[32px] h-full justify-center items-center no-move px-0.5 cursor-default group transition-all duration-200 hover:bg-red-600/80 "
          onClick={() => window.electron.ipcRenderer.send('close')}
        >
          <IoClose className="m-auto text-gray-300 group-hover:text-white" size={18} />
        </button>
      </div>
    </header>
  )
}
