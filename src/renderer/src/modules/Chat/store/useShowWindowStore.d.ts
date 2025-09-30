type HideWindowProps = {
    showWindow: boolean;
    setShowWindow: (boolean: boolean) => void;
};
export declare const useShowWindowStore: import("zustand").UseBoundStore<import("zustand").StoreApi<HideWindowProps>>;
export {};
