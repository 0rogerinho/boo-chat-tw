import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Libs
import { cn } from '../../../shared/lib/cn';
// React icons
import { IoClose } from 'react-icons/io5';
import { CgBorderStyleSolid } from 'react-icons/cg';
import { FaEyeSlash } from 'react-icons/fa6';
import { IoMdSettings } from 'react-icons/io';
import useHeader from '../hooks/useHeader';
import { VscExpandAll } from 'react-icons/vsc';
export const Header = ({ eyeClick }) => {
    const { platform, showWindow, fullScreen, setFullScreen, handleShowWindow, openConfigWindow } = useHeader();
    return (_jsxs("header", { className: cn('fixed w-full bg-gray-900/95 backdrop-blur-sm move-page flex justify-between items-center rounded-t-md overflow-hidden transition-all duration-300 opacity-100 visible border-b border-gray-600', !showWindow && 'opacity-0 bg-transparent border-transparent'), children: [_jsxs("div", { className: cn('flex items-center', platform === 'darwin' && 'ml-auto'), children: [_jsx("button", { className: "flex size-8 min-w-[32px] items-center justify-center group no-move hover:bg-gray-800/80 transition-all duration-200 rounded-sm", onClick: () => openConfigWindow(), children: _jsx(IoMdSettings, { className: "m-auto text-gray-300 group-hover:text-white transition-all duration-200", size: 16 }) }), _jsx("button", { className: "flex size-8 min-w-[32px] items-center justify-center group no-move hover:bg-gray-800/80 transition-all duration-200 rounded-sm", onClick: () => {
                            eyeClick(), handleShowWindow();
                        }, children: _jsx(FaEyeSlash, { className: "m-auto text-gray-300 group-hover:text-white transition-all duration-200", size: 16 }) })] }), platform !== 'darwin' && (_jsxs("div", { className: "flex h-full", children: [_jsx("button", { className: "flex w-8 max-w-[32px] min-h-[32px] h-full justify-center items-center hover:bg-gray-800/80 no-move px-0.5 cursor-default group transition-all duration-200 ", onClick: () => window.electron.ipcRenderer.send('closeFilePreview'), children: _jsx(CgBorderStyleSolid, { className: "m-auto text-gray-300 group-hover:text-white", size: 14 }) }), _jsx("button", { className: "flex w-8 max-w-[32px] min-h-[32px] h-full justify-center items-center no-move px-0.5 cursor-default group transition-all duration-200 hover:bg-primary-600/80", onClick: () => {
                            window.electron.ipcRenderer.send('setFullScreen', !fullScreen),
                                setFullScreen(!fullScreen);
                        }, children: _jsx(VscExpandAll, { className: "m-auto text-gray-300 group-hover:text-white", size: 14 }) }), _jsx("button", { className: "flex w-8 max-w-[32px] min-h-[32px] h-full justify-center items-center no-move px-0.5 cursor-default group transition-all duration-200 hover:bg-red-600/80 ", onClick: () => window.electron.ipcRenderer.send('close'), children: _jsx(IoClose, { className: "m-auto text-gray-300 group-hover:text-white", size: 18 }) })] }))] }));
};
