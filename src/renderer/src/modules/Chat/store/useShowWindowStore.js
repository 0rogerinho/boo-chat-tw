import { create } from 'zustand';
export const useShowWindowStore = create((set) => ({
    showWindow: true,
    setShowWindow: (showScreen) => set({ showWindow: showScreen }),
}));
