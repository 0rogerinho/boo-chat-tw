import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Config } from '../../modules/Config';
import { Chat } from '../../modules/Chat';
import { Routes, Route, HashRouter } from 'react-router-dom';
export default function Routers() {
    return (_jsx(HashRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Chat, {}) }), _jsx(Route, { path: `/config`, element: _jsx(Config, {}) })] }) }));
}
