import { create } from 'zustand';
export const useConfigStore = create((set) => ({
    config: null,
    setConfig: (data) => set({ config: data })
}));
