export declare const platform: {
    isWindows: boolean;
    isMacOS: boolean;
    isLinux: boolean;
    getIconPath(): string;
    getAppName(): string;
    getAppVersion(): string;
    getAppId(): string;
    getTrayIcon(): string;
    getWindowIcon(): string;
    isDev(): boolean;
    getPlatformSpecificConfig(): {
        windows: {
            frame: boolean;
            transparent: boolean;
            autoHideMenuBar: boolean;
            icon: string;
        };
        macos: {
            frame: boolean;
            transparent: boolean;
            autoHideMenuBar: boolean;
            icon: string;
            titleBarStyle: string;
        };
        linux: {
            frame: boolean;
            transparent: boolean;
            autoHideMenuBar: boolean;
            icon: string;
        };
    };
};
