interface ChatMessage {
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
export default function useYouTubeChat(): {
    youtubeChat: ChatMessage[];
    isConnected: boolean;
    error: string | null;
    isLoading: boolean;
    processYouTubeEmojis: (message: string) => string;
};
export {};
