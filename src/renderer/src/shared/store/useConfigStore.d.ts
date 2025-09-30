export type TConfigDataProps = {
    kick: {
        slug: string;
        id?: number;
        user_id?: number;
    };
    twitch: {
        channel: string;
    };
    youtube: {
        channelName: string;
        channelId?: string;
    };
    x: number;
    y: number;
    width: number;
    height: number;
    font: {
        size: number;
        weight: number;
    };
};
type HideWindowProps = {
    config: TConfigDataProps | null;
    setConfig: (data: HideWindowProps['config']) => void;
};
export declare const useConfigStore: import("zustand").UseBoundStore<import("zustand").StoreApi<HideWindowProps>>;
export {};
