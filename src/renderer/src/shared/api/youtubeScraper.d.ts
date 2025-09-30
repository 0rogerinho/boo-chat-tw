export interface ScrapedChannel {
    id: string;
    title: string;
    customUrl?: string;
    isLive: boolean;
    liveVideoId?: string;
    liveChatId?: string;
}
export interface ScrapedChatMessage {
    id: string;
    author: {
        name: string;
        color: string;
    };
    message: {
        text: string;
    };
    timestamp: number;
}
declare class YouTubeScraperService {
    searchChannel(query: string): Promise<ScrapedChannel | null>;
    private searchChannelByLive;
    getLiveChatInfo(channelId: string): Promise<{
        videoId: string;
        chatId: string;
    } | null>;
    private getChatIdFromVideo;
    getLiveChatMessages(chatId: string): Promise<ScrapedChatMessage[]>;
    private getLiveChatMessagesAlternative;
    private fetchPage;
    private parseChannelFromHTML;
    private parseChatMessages;
    private parseMessageRenderer;
    private generateUserColor;
}
export default YouTubeScraperService;
