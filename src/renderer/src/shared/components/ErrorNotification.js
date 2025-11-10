import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
export const ErrorNotification = ({ error, onClose, duration = 5000 }) => {
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        if (error) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300); // Aguarda a animação de saída
            }, duration);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [error, duration, onClose]);
    if (!error)
        return null;
    return (_jsx("div", { className: `fixed top-4 right-4 z-50 max-w-md transform transition-all duration-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`, children: _jsxs("div", { className: "bg-red-600 border border-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-start space-x-3", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-red-200", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium", children: "Erro" }), _jsx("p", { className: "text-sm text-red-100 mt-1", children: error })] }), _jsx("button", { onClick: () => {
                        setIsVisible(false);
                        setTimeout(onClose, 300);
                    }, className: "flex-shrink-0 text-red-200 hover:text-white transition-colors", children: _jsx("svg", { className: "h-4 w-4", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" }) }) })] }) }));
};
export const SuccessNotification = ({ message, onClose, duration = 3000 }) => {
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        if (message) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300); // Aguarda a animação de saída
            }, duration);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [message, duration, onClose]);
    if (!message)
        return null;
    return (_jsx("div", { className: `fixed top-4 right-4 z-50 max-w-md transform transition-all duration-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`, children: _jsxs("div", { className: "bg-green-600 border border-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-start space-x-3", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("svg", { className: "h-5 w-5 text-green-200", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium", children: "Sucesso" }), _jsx("p", { className: "text-sm text-green-100 mt-1", children: message })] }), _jsx("button", { onClick: () => {
                        setIsVisible(false);
                        setTimeout(onClose, 300);
                    }, className: "flex-shrink-0 text-green-200 hover:text-white transition-colors", children: _jsx("svg", { className: "h-4 w-4", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" }) }) })] }) }));
};
