import { TConfigDataProps } from '../../../shared/store/useConfigStore';
interface IEmojis {
    id: string;
    posInit: number;
    posEnd: number;
}
interface IChat {
    name?: string;
    message: string;
    color?: string;
    emojis?: IEmojis[] | string;
    timestamp?: number;
}
export declare function useModel(): {
    chat: IChat[];
    messagesEndRef: import("react").RefObject<HTMLDivElement>;
    showWindow: boolean;
    processMessageHTML: (html: string) => string;
    config: TConfigDataProps | null;
};
export {};
