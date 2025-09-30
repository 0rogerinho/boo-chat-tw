export default function useHeader(): {
    showWindow: boolean;
    fullScreen: boolean;
    setFullScreen: import("react").Dispatch<import("react").SetStateAction<boolean>>;
    openConfigWindow: () => void;
    handleShowWindow: () => void;
};
