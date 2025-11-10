import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Libs
import { cn } from '../../shared/lib';
import { useEffect, useState } from 'react';
// Components
import { Header } from './components/Header';
import useKickChat from './hooks/useKickChat';
import useYouTubeChat from './hooks/useYouTubeChat';
import { useModel } from './hooks/useModel';
// Assets
import twitchLogo from '../../shared/assets/twitch-logo.png';
import kickLogo from '../../shared/assets/kick-logo.webp';
import youtubeLogo from '../../shared/assets/youtube-logo.png';
export const Chat = () => {
    const [allChats, setAllChats] = useState([]);
    const { chat, messagesEndRef, showWindow, processMessageHTML, config } = useModel();
    const { kickChat } = useKickChat();
    const { youtubeChat } = useYouTubeChat();
    // Função para obter o logo da plataforma
    const getPlatformLogo = (platform) => {
        switch (platform) {
            case 'twitch':
                return twitchLogo;
            case 'kick':
                return kickLogo;
            case 'youtube':
                return youtubeLogo;
            default:
                return twitchLogo;
        }
    };
    useEffect(() => {
        const allMessages = [
            ...chat.map((data, index) => ({
                ...data,
                id: `twitch-${index}`,
                platform: 'twitch',
                author: {
                    name: data.name,
                    color: data.color ?? 'blue'
                },
                message: {
                    text: data.message
                },
                timestamp: data.timestamp || Date.now()
            })),
            ...kickChat.map((data, index) => ({
                ...data,
                id: `kick-${index}`,
                platform: 'kick',
                author: {
                    name: data.sender?.username || 'Kick User',
                    color: data.sender.identity.color ?? '#00ff00'
                },
                message: {
                    text: data.content || data.message || ''
                },
                timestamp: data.timestamp || Date.now()
            })),
            ...youtubeChat.map((data, index) => ({
                id: `youtube-${index}`,
                platform: 'youtube',
                author: {
                    name: data.author?.name || 'YouTube User',
                    color: data.author?.color ?? '#ff0000'
                },
                message: {
                    text: data.message?.text || data.content || ''
                },
                timestamp: data.timestamp || Date.now()
            }))
        ];
        // Ordenar mensagens por timestamp (mais antigas primeiro)
        const sortedMessages = allMessages.sort((a, b) => a.timestamp - b.timestamp);
        setAllChats(sortedMessages);
    }, [chat, kickChat, youtubeChat]);
    // Scroll automático para novas mensagens de todas as plataformas
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [allChats]);
    return (_jsxs("main", { className: cn('relative w-screen h-screen flex flex-col overflow-hidden rounded-[8px] bg-gray-900/95 backdrop-blur-sm border border-gray-600/80', !showWindow && 'bg-transparent backdrop-blur-none border-transparent'), children: [_jsx(Header, { eyeClick: () => { } }), _jsxs("div", { className: cn('mt-8 overflow-y-auto overflow-x-hidden flex-1 scroll px-3 pb-3', !showWindow && 'scroll-none'), children: [_jsx("div", { className: "space-y-2", children: allChats
                            .sort((a, b) => a.timestamp - b.timestamp)
                            .map((data, index) => (_jsxs("div", { className: cn('flex gap-2 p-0 rounded-md transition-all duration-200 fade-in', index % 2 === 0 && 'bg-gray-800/10', !showWindow && 'bg-transparent'), children: [_jsx("span", { className: "flex-shrink-0 mt-1 inline", children: _jsx("img", { src: getPlatformLogo(data.platform), alt: `${data.platform} logo`, className: "w-4 h-4 object-cover rounded-sm" }) }), _jsxs("div", { className: "items-center min-w-0 inline", children: [_jsxs("span", { className: "text-outline text-nowrap inline mr-1", style: {
                                                color: data.author.color,
                                                fontSize: `${config?.font?.size ?? 14}px`,
                                                fontWeight: config?.font?.weight ?? 400
                                            }, children: [data.author.name, ":"] }), _jsx("div", { className: "text-white inline text-outline-two break-words mt-0.5 leading-relaxed", style: {
                                                fontSize: `${config?.font?.size ?? 14}px`,
                                                fontWeight: config?.font?.weight ?? 400
                                            }, dangerouslySetInnerHTML: {
                                                __html: processMessageHTML(data.message.text)
                                            } })] })] }, data.id))) }), _jsx("div", { ref: messagesEndRef })] })] }));
};
