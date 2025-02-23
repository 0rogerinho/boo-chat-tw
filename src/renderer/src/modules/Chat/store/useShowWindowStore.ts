import { create } from 'zustand';

type HideWindowProps = {
  showWindow: boolean;
  setShowWindow: (boolean: boolean) => void;
};

export const useShowWindowStore = create<HideWindowProps>((set) => ({
  showWindow: true,
  setShowWindow: (showScreen) => set({ showWindow: showScreen }),
}));
