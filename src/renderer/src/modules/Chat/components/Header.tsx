// Libs
import { cn } from '../../../shared/lib/cn'
// React icons
import { IoClose } from 'react-icons/io5'
import { CgBorderStyleSolid } from 'react-icons/cg'
import { FaEyeSlash } from 'react-icons/fa6'
import { IoMdSettings } from 'react-icons/io'
import useHeader from '../hooks/useHeader'
import { VscExpandAll } from 'react-icons/vsc'

interface IHeader {
  eyeClick: () => void
}

export const Header = ({ eyeClick }: IHeader) => {
  const { showWindow, fullScreen, setFullScreen, handleShowWindow, openConfigWindow } = useHeader()

  return (
    <header
      className={cn(
        'fixed w-full bg-gray-900/95 backdrop-blur-sm move-page flex justify-between items-center rounded-t-md overflow-hidden transition-all duration-300 opacity-100 visible border-b border-gray-700/50',
        !showWindow && 'opacity-0 bg-transparent border-transparent'
      )}
    >
      <div className="flex items-center">
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

        {/* Hide/Show */}
        <button
          className="flex size-8 min-w-[32px] items-center justify-center group no-move hover:bg-gray-800/80 transition-all duration-200 rounded-sm"
          onClick={() => {
            eyeClick(), handleShowWindow()
          }}
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
