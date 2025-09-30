import { BrowserWindow } from 'electron';
export type configData = {
    channel: string;
};
export declare const registerIPC: (win: BrowserWindow) => void;
