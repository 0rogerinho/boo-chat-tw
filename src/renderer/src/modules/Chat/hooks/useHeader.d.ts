export default function useHeader(): {
    platform: string | undefined;
    showWindow: boolean;
    fullScreen: boolean;
    setFullScreen: import("react").Dispatch<import("react").SetStateAction<boolean>>;
    openConfigWindow: () => void;
    handleShowWindow: () => void;
};
