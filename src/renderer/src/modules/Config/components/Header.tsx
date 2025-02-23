import { CgBorderStyleSolid } from 'react-icons/cg'
import { IoClose } from 'react-icons/io5'

export default function Header() {
  return (
    <header className="w-full h-[24px] flex justify-end items-center bg-gray-900 move-page transition-opacity duration-200 opacity-100 visible">
      {/* Minimize */}
      <button
        className="flex w-[30px] max-w-[30px] h-full justify-center items-center hover:bg-slate-800 no-move text-gray-700 px-0.5 cursor-default group transition-all duration-200"
        onClick={() => window.electron.ipcRenderer.send('close-file-preview-config')}
      >
        <CgBorderStyleSolid className=" m-auto text-slate-100" size={18} />
      </button>

      {/* Close */}
      <button
        className="flex w-[30px] max-w-[30px] h-full justify-center items-center hover:bg-red-500 no-move text-gray-700 px-0.5 cursor-default group transition-all duration-200"
        onClick={() => window.electron.ipcRenderer.send('close-config')}
      >
        <IoClose className=" m-auto text-slate-100" size={18} />
      </button>
    </header>
  )
}
