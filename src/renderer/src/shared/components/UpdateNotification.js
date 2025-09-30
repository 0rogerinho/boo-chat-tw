import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { CheckCircle, Download, AlertCircle, X } from 'lucide-react';
export const UpdateNotification = ({ onClose }) => {
    const [updateInfo, setUpdateInfo] = useState(null);
    const [isChecking, setIsChecking] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [error, setError] = useState(null);
    const [isUpdateDownloaded, setIsUpdateDownloaded] = useState(false);
    useEffect(() => {
        // Configurar listeners para eventos do updater
        const handleCheckingForUpdate = () => {
            setIsChecking(true);
            setError(null);
        };
        const handleUpdateAvailable = (info) => {
            setUpdateInfo(info);
            setIsChecking(false);
        };
        const handleUpdateNotAvailable = () => {
            setIsChecking(false);
            setError('Nenhuma atualização disponível');
        };
        const handleError = (errorMessage) => {
            setError(errorMessage);
            setIsChecking(false);
            setIsDownloading(false);
        };
        const handleDownloadProgress = (progress) => {
            setDownloadProgress(progress.percent);
        };
        const handleUpdateDownloaded = () => {
            setIsDownloading(false);
            setIsUpdateDownloaded(true);
        };
        // Registrar listeners
        window.api.onUpdaterCheckingForUpdate(handleCheckingForUpdate);
        window.api.onUpdaterUpdateAvailable(handleUpdateAvailable);
        window.api.onUpdaterUpdateNotAvailable(handleUpdateNotAvailable);
        window.api.onUpdaterError(handleError);
        window.api.onUpdaterDownloadProgress(handleDownloadProgress);
        window.api.onUpdaterUpdateDownloaded(handleUpdateDownloaded);
        // Cleanup
        return () => {
            window.api.removeAllUpdaterListeners();
        };
    }, []);
    const handleCheckForUpdates = async () => {
        try {
            setIsChecking(true);
            setError(null);
            const result = await window.api.checkForUpdates();
            if (!result.success) {
                setError(result.error || 'Erro ao verificar atualizações');
            }
        }
        catch (err) {
            setError('Erro ao verificar atualizações');
        }
    };
    const handleDownloadUpdate = async () => {
        try {
            setIsDownloading(true);
            setError(null);
            const result = await window.api.downloadUpdate();
            if (!result.success) {
                setError(result.error || 'Erro ao baixar atualização');
                setIsDownloading(false);
            }
        }
        catch (err) {
            setError('Erro ao baixar atualização');
            setIsDownloading(false);
        }
    };
    const handleInstallUpdate = async () => {
        try {
            await window.api.installUpdate();
        }
        catch (err) {
            setError('Erro ao instalar atualização');
        }
    };
    if (error && !updateInfo) {
        return (_jsxs("div", { className: "fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg max-w-sm z-50", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(AlertCircle, { className: "w-5 h-5" }), _jsx("span", { className: "font-medium", children: "Erro de Atualiza\u00E7\u00E3o" })] }), _jsx("button", { onClick: onClose, className: "hover:bg-red-600 rounded p-1", children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsx("p", { className: "mt-2 text-sm", children: error }), _jsx("button", { onClick: handleCheckForUpdates, className: "mt-3 bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm", children: "Tentar Novamente" })] }));
    }
    if (isUpdateDownloaded) {
        return (_jsxs("div", { className: "fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg max-w-sm z-50", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(CheckCircle, { className: "w-5 h-5" }), _jsx("span", { className: "font-medium", children: "Atualiza\u00E7\u00E3o Pronta" })] }), _jsx("button", { onClick: onClose, className: "hover:bg-green-600 rounded p-1", children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsx("p", { className: "mt-2 text-sm", children: "A atualiza\u00E7\u00E3o foi baixada e est\u00E1 pronta para instala\u00E7\u00E3o." }), _jsxs("div", { className: "mt-3 flex space-x-2", children: [_jsx("button", { onClick: handleInstallUpdate, className: "bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm", children: "Instalar Agora" }), _jsx("button", { onClick: onClose, className: "bg-green-600/50 hover:bg-green-600 px-3 py-1 rounded text-sm", children: "Depois" })] })] }));
    }
    if (updateInfo) {
        return (_jsxs("div", { className: "fixed top-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg max-w-sm z-50", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Download, { className: "w-5 h-5" }), _jsx("span", { className: "font-medium", children: "Atualiza\u00E7\u00E3o Dispon\u00EDvel" })] }), _jsx("button", { onClick: onClose, className: "hover:bg-blue-600 rounded p-1", children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsxs("p", { className: "mt-2 text-sm", children: ["Nova vers\u00E3o ", updateInfo.version, " est\u00E1 dispon\u00EDvel!"] }), _jsx("p", { className: "mt-1 text-xs opacity-75", children: "\u2728 Teste de atualiza\u00E7\u00E3o autom\u00E1tica - v1.0.1" }), isDownloading && (_jsxs("div", { className: "mt-3", children: [_jsxs("div", { className: "flex justify-between text-sm mb-1", children: [_jsx("span", { children: "Baixando..." }), _jsxs("span", { children: [Math.round(downloadProgress), "%"] })] }), _jsx("div", { className: "w-full bg-blue-600/30 rounded-full h-2", children: _jsx("div", { className: "bg-white h-2 rounded-full transition-all duration-300", style: { width: `${downloadProgress}%` } }) })] })), !isDownloading && (_jsxs("div", { className: "mt-3 flex space-x-2", children: [_jsx("button", { onClick: handleDownloadUpdate, className: "bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm", children: "Baixar Agora" }), _jsx("button", { onClick: onClose, className: "bg-blue-600/50 hover:bg-blue-600 px-3 py-1 rounded text-sm", children: "Depois" })] }))] }));
    }
    if (isChecking) {
        return (_jsx("div", { className: "fixed top-4 right-4 bg-gray-500 text-white p-4 rounded-lg shadow-lg max-w-sm z-50", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" }), _jsx("span", { className: "text-sm", children: "Verificando atualiza\u00E7\u00F5es..." })] }) }));
    }
    return null;
};
