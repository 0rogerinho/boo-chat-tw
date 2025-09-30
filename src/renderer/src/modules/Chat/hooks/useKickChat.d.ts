type TKickChat = {
    id: string;
    content: string;
    type: string;
    created_at: string;
    sender: {
        id: number;
        username: string;
        slug: string;
        identity: {
            color: string;
            badges: string[];
        };
    };
    metadata: {
        message_ref: string;
    };
    timestamp: number;
};
export default function useKickChat(): {
    kickChat: TKickChat[];
    isConnected: boolean;
};
export {};
