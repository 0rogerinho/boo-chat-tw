import { useConfigStore } from '../../../shared/store/useConfigStore';
import { useEffect, useState, useRef } from 'react';
import YouTubeScraperService from '../../../shared/api/youtubeScraper';
// const bots = ['StreamElements', 'Usuário']
export default function useYouTubeChat() {
    const [youtubeChat, setYoutubeChat] = useState([]);
    console.log('youtubeChat', youtubeChat);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { config } = useConfigStore();
    const intervalRef = useRef(null);
    const processedMessageIds = useRef(new Set());
    const liveChatIdRef = useRef(null);
    const nextPageTokenRef = useRef(null);
    // Configuração do intervalo de polling (em ms)
    const POLLING_INTERVAL = 1500; // 1.5 segundos para melhor responsividade
    // Função para processar emojis do YouTube
    const processYouTubeEmojis = (message) => {
        // Regex para encontrar emojis no formato [emoji:ID:nome] ou outros formatos do YouTube
        const emojiRegex = /\[emoji:(\d+):([^\]]+)\]/g;
        return message.replace(emojiRegex, (_, emojiId, emojiName) => {
            const emojiUrl = `https://yt3.ggpht.com/${emojiId}`;
            return `<img style="display:inline; width:24px; height:24px; vertical-align:middle; margin:0 2px;" src="${emojiUrl}" alt="${emojiName}" title="${emojiName}" />`;
        });
    };
    // Função para conectar via scraping (método gratuito)
    const connectViaScraping = async (channelName) => {
        try {
            console.log('🔗 Conectando via scraping (gratuito):', channelName);
            setIsLoading(true);
            setError(null);
            const scraper = new YouTubeScraperService();
            // Buscar canal
            const channel = await scraper.searchChannel(channelName);
            if (!channel) {
                throw new Error(`Canal "${channelName}" não encontrado.`);
            }
            console.log('✅ Canal encontrado via scraping:', channel.title);
            // Verificar se está ao vivo usando método mais robusto
            console.log('🔍 Verificando se canal está ao vivo...');
            const liveInfo = await scraper.getLiveChatInfo(channel.id);
            if (!liveInfo) {
                console.log('❌ Canal não está ao vivo ou não foi possível detectar');
                throw new Error('Canal não está transmitindo ao vivo no momento.');
            }
            console.log('✅ Chat ao vivo ativo encontrado via scraping:', liveInfo.chatId);
            // Iniciar polling das mensagens via scraping
            startScrapingPolling(scraper, liveInfo.chatId);
            return true;
        }
        catch (error) {
            console.error('Erro ao conectar via scraping:', error);
            setError(error instanceof Error ? error.message : 'Erro desconhecido');
            setIsLoading(false);
            return false;
        }
    };
    // Função para iniciar o polling via scraping
    const startScrapingPolling = (scraper, chatId) => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        const pollMessages = async () => {
            try {
                const messages = await scraper.getLiveChatMessages(chatId);
                if (messages.length > 0) {
                    setYoutubeChat((prevChat) => {
                        // Filtrar mensagens duplicadas usando o estado atual
                        const newMessages = messages.filter((data) => !prevChat.some((msg) => msg.author.name === data.author.name && msg.message.text === data.message.text));
                        if (newMessages.length > 0) {
                            const updatedChat = [...prevChat, ...newMessages];
                            return updatedChat;
                        }
                        return prevChat;
                    });
                }
                setIsLoading(false);
                setIsConnected(true);
            }
            catch (error) {
                console.error('Erro ao obter mensagens via scraping:', error);
                setError('Erro ao obter mensagens do chat');
            }
        };
        // Fazer polling com intervalo configurável para melhor responsividade
        intervalRef.current = setInterval(pollMessages, POLLING_INTERVAL);
        // Buscar mensagens iniciais imediatamente
        pollMessages();
    };
    // Função para limpar recursos
    const cleanup = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        processedMessageIds.current.clear();
        liveChatIdRef.current = null;
        nextPageTokenRef.current = null;
        setIsConnected(false);
        setIsLoading(false);
    };
    useEffect(() => {
        if (!config?.youtube?.channelName) {
            cleanup();
            return;
        }
        // Limpar estado anterior
        // setYoutubeChat([])
        setError(null);
        cleanup();
        const connectToYouTube = async () => {
            try {
                setYoutubeChat((prev) => [
                    ...prev,
                    {
                        id: `Conexão-YouTube-${Date.now()}`,
                        author: {
                            name: 'YouTube-connect',
                            color: '#ff0000'
                        },
                        message: {
                            text: `Conectando ao canal "${config.youtube.channelName}" ...`
                        },
                        timestamp: Date.now()
                    }
                ]);
                // Usar apenas scraping (método gratuito)
                const scrapingSuccess = await connectViaScraping(config.youtube.channelName);
                setYoutubeChat((prev) => [
                    ...prev,
                    {
                        id: `Conexão-YouTube-${Date.now()}`,
                        author: {
                            name: 'YouTube-connect',
                            color: '#ff0000'
                        },
                        message: {
                            text: `Conectado ao "${config.youtube.channelName}"`
                        },
                        timestamp: Date.now()
                    }
                ]);
                if (!scrapingSuccess) {
                    setIsConnected(false);
                }
            }
            catch (error) {
                setYoutubeChat((prev) => [
                    ...prev,
                    {
                        id: `Conexão-YouTube-${Date.now()}`,
                        author: {
                            name: 'YouTube-connect',
                            color: '#ff0000'
                        },
                        message: {
                            text: `Falha ao conectar ao canal "${config.youtube.channelName}"`
                        },
                        timestamp: Date.now()
                    }
                ]);
                console.error('Erro ao conectar ao YouTube:', error);
                setError('Erro ao conectar ao YouTube');
                setIsConnected(false);
            }
        };
        connectToYouTube();
        return cleanup;
    }, [config?.youtube?.channelName]);
    // Cleanup ao desmontar
    useEffect(() => {
        return cleanup;
    }, []);
    return {
        youtubeChat,
        isConnected,
        error,
        isLoading,
        processYouTubeEmojis
    };
}
