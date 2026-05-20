'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export { DEFAULT_PRAISES, PRAISE_EMOJI } from '@/lib/chungsora/logV2';

type PraiseState = {
  customPraises: string[];
  setCustomPraises: (presets: string[]) => void;
  addPraise: (phrase: string) => void;
  removePraise: (phrase: string) => void;
};

export const usePraiseStore = create<PraiseState>()(
  persist(
    (set) => ({
      customPraises: ['우리 지민 최고', '100점'],
      setCustomPraises: (presets) => set({ customPraises: presets.slice(0, 8) }),
      addPraise: (phrase) => {
        const trimmed = phrase.trim();
        if (!trimmed) return;
        set((s) => ({
          customPraises: [trimmed, ...s.customPraises.filter((p) => p !== trimmed)].slice(0, 8),
        }));
      },
      removePraise: (phrase) =>
        set((s) => ({ customPraises: s.customPraises.filter((p) => p !== phrase) })),
    }),
    { name: 'chungsora-praise-v1' },
  ),
);
