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
        'fixed w-full bg-gray-900 move-page flex justify-between items-center rounded-t-md overflow-hidden transition-opacity duration-200 opacity-100 visible',
        !showWindow && 'opacity-0 bg-[rgba(0,0,0,0))] visible'
      )}
    >
      <div className="flex">
        {/* Settings */}
        <button
          className="flex size-6 min-w-[30px] items-center justify-center group no-move hover:bg-slate-800"
          onClick={() => openConfigWindow()}
        >
          <IoMdSettings
            className="m-auto text-white group-hover:opacity-100 transition-all duration-200"
            size={16}
          />
        </button>

        {/* transparent background */}
        <button
          className="flex size-6 min-w-[30px] items-center justify-center group no-move hover:bg-slate-800"
          onClick={() => {
            eyeClick(), handleShowWindow()
          }}
        >
          <FaEyeSlash
            className="m-auto text-white group-hover:opacity-100 transition-all duration-200"
            size={16}
          />
        </button>
      </div>

      <div className="flex h-full">
        <button
          className="flex w-[30px] max-w-[30px] min-h-[20px] h-full justify-center items-center hover:bg-slate-800 no-move text-gray-700 px-0.5 cursor-default group transition-all duration-200"
          onClick={() => window.electron.ipcRenderer.send('closeFilePreview')}
        >
          <CgBorderStyleSolid className=" m-auto text-slate-100" size={14} />
        </button>

        <button
          className="flex w-[30px] max-w-[30px] min-h-[20px] h-full justify-center items-center no-move text-gray-700 px-0.5 cursor-default group transition-all duration-200 hover:bg-green-600"
          onClick={() => {
            window.electron.ipcRenderer.send('setFullScreen', !fullScreen),
              setFullScreen(!fullScreen)
          }}
        >
          <VscExpandAll className="m-auto text-slate-100" size={14} />
        </button>

        <button
          className="flex w-[30px] max-w-[30px] min-h-[20px] h-full justify-center items-center no-move text-gray-700 px-0.5 cursor-default group transition-all duration-200 hover:bg-red-600"
          onClick={() => window.electron.ipcRenderer.send('close')}
        >
          <IoClose className=" m-auto text-slate-100" size={18} />
        </button>
      </div>
    </header>
  )
}
