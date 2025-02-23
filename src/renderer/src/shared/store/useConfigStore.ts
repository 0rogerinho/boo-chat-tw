import { create } from 'zustand';

type HideWindowProps = {
  config: { channel: string };
  setConfig: (data: HideWindowProps['config']) => void;
};

export const useConfigStore = create<HideWindowProps>((set) => ({
  config: { channel: '' },
  setConfig: (data) => set({ config: data }),
}));
