import { useConfigStore } from '../../../shared/store/useConfigStore';
import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';
export default function useKickChat() {
    const [kickChat, setKickChat] = useState([]);
    console.log('kickChat', kickChat);
    const [isConnected, setIsConnected] = useState(false);
    const { config } = useConfigStore();
    // Função para processar emojis da Kick
    const processKickEmojis = (message) => {
        console.log('🔍 Processando mensagem:', message);
        // Regex para encontrar emojis no formato [emote:ID:nome]
        const emojiRegex = /\[emote:(\d+):([^\]]+)\]/g;
        const result = message.replace(emojiRegex, (_, emoteId, emoteName) => {
            console.log('🎯 Encontrou emoji:', { emoteId, emoteName });
            // URL base para emojis da Kick
            const emojiUrl = `https://files.kick.com/emotes/${emoteId}/fullsize`;
            console.log('🔗 URL do emoji:', emojiUrl);
            // Retorna a tag img com o emoji
            const imgTag = `<img style="display:inline; width:24px; height:24px; vertical-align:middle; margin:0 2px;" src="${emojiUrl}" alt="${emoteName}" title="${emoteName}" />`;
            console.log('🖼️ Tag img gerada:', imgTag);
            return imgTag;
        });
        console.log('✅ Resultado final:', result);
        return result;
    };
    useEffect(() => {
        if (!config?.kick.slug)
            return;
        let pusher = null;
        const connectToKick = async () => {
            try {
                setKickChat((prev) => [
                    ...prev,
                    {
                        id: 'Conexão-Kick',
                        content: `Conectando com o canal "${config.kick.slug}"...`,
                        type: 'message',
                        created_at: '',
                        sender: {
                            id: 123123,
                            username: 'Kick-connect',
                            slug: '',
                            identity: {
                                color: '#52fb17',
                                badges: []
                            }
                        },
                        metadata: {
                            message_ref: 'Conexão-Kick'
                        },
                        timestamp: Date.now()
                    }
                ]);
                // Obter informações do canal
                const channelResponse = await fetch(`https://kick.com/api/v1/channels/${config.kick.slug}`);
                const channelData = await channelResponse.json();
                if (!channelData.chatroom?.id) {
                    console.error('Canal não encontrado:', config.kick.slug);
                    return;
                }
                // Conectar ao Pusher com a chave que funciona
                pusher = new Pusher('32cbd69e4b950bf97679', {
                    cluster: 'us2',
                    forceTLS: true,
                    enabledTransports: ['wss', 'ws']
                });
                pusher.connection.bind('connected', () => {
                    setKickChat((prev) => [
                        ...prev,
                        {
                            id: 'Conexão-Kick',
                            content: `Conectado ao chat do canal "${config.kick.slug}"`,
                            type: 'message',
                            created_at: '',
                            sender: {
                                id: 123123,
                                username: 'Kick-connect',
                                slug: '',
                                identity: {
                                    color: '#52fb17',
                                    badges: []
                                }
                            },
                            metadata: {
                                message_ref: 'Conexão-Kick'
                            },
                            timestamp: Date.now()
                        }
                    ]);
                    setIsConnected(true);
                });
                pusher.connection.bind('disconnected', () => {
                    setIsConnected(false);
                });
                pusher.connection.bind('error', () => {
                    setIsConnected(false);
                });
                // Subscrever ao canal
                const channel = pusher.subscribe(`chatrooms.${channelData.chatroom.id}.v2`);
                channel.bind('App\\Events\\ChatMessageEvent', (data) => {
                    console.log('📨 Dados brutos da Kick:', data);
                    // Processar emojis da Kick
                    const originalContent = data.content || data.message || '';
                    const processedContent = processKickEmojis(originalContent);
                    console.log('📝 Conteúdo original:', originalContent);
                    console.log('🎨 Conteúdo processado:', processedContent);
                    const processedData = {
                        ...data,
                        content: processedContent,
                        timestamp: Date.now()
                    };
                    setKickChat((prevData) => [...prevData, processedData]);
                });
            }
            catch (error) {
                console.error('Erro ao conectar ao Kick:', error);
                setIsConnected(false);
            }
        };
        connectToKick();
        return () => {
            if (pusher) {
                pusher.disconnect();
            }
        };
    }, [config?.kick.slug]);
    return { kickChat, isConnected };
}
