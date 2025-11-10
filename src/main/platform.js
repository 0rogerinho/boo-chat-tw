import { app } from 'electron';
import path from 'path';
export const platform = {
    isWindows: process.platform === 'win32',
    isMacOS: process.platform === 'darwin',
    isLinux: process.platform === 'linux',
    getIconPath() {
        if (this.isWindows) {
            return path.join(__dirname, '../../icon.ico');
        }
        else if (this.isMacOS) {
            return path.join(__dirname, '../../build/icon.icns');
        }
        else {
            return path.join(__dirname, '../../build/icon.png');
        }
    },
    getAppName() {
        return app.getName();
    },
    getAppVersion() {
        return app.getVersion();
    },
    getAppId() {
        return app.isPackaged ? 'com.devrogerinho.boochat' : 'com.devrogerinho.boochat.dev';
    },
    getTrayIcon() {
        // Para tray, sempre usar PNG pois é mais compatível
        return path.join(__dirname, '../../resources/icon.png');
    },
    getWindowIcon() {
        return this.getIconPath();
    },
    isDev() {
        return !app.isPackaged;
    },
    getPlatformSpecificConfig() {
        return {
            windows: {
                frame: false,
                transparent: true,
                autoHideMenuBar: false,
                icon: this.getWindowIcon()
            },
            macos: {
                frame: false,
                transparent: true,
                autoHideMenuBar: false,
                icon: this.getWindowIcon(),
                titleBarStyle: 'hiddenInset'
            },
            linux: {
                frame: false,
                transparent: true,
                autoHideMenuBar: false,
                icon: this.getWindowIcon()
            }
        };
    }
};
