'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { wonToP } from './tokens';

type PointsState = {
  balance: number;
  history: { label: string; won: number; at: string }[];
  spend: (label: string, won: number) => boolean;
  add: (amount: number) => void;
  canAfford: (won: number) => boolean;
};

export const usePointsStore = create<PointsState>()(
  persist(
    (set, get) => ({
      balance: 320,
      history: [],
      canAfford: (won) => get().balance >= wonToP(won),
      spend: (label, won) => {
        const cost = wonToP(won);
        if (get().balance < cost) return false;
        set({
          balance: get().balance - cost,
          history: [
            { label, won, at: new Date().toISOString() },
            ...get().history,
          ].slice(0, 20),
        });
        return true;
      },
      add: (amount) => set({ balance: get().balance + amount }),
    }),
    { name: 'chungsora-points-v1' },
  ),
);
