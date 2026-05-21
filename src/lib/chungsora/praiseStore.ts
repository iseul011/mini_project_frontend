'use client';

import { create } from 'zustand';

export { PRAISE_EMOJI } from '@/lib/chungsora/logV2';

type PraiseState = {
  customPraises: string[];
  setCustomPraises: (presets: string[]) => void;
};

export const usePraiseStore = create<PraiseState>()((set) => ({
  customPraises: [],
  setCustomPraises: (presets) => set({ customPraises: presets.slice(0, 8) }),
}));
