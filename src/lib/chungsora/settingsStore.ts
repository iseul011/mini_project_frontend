'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEMO_BASE_CLEAN_WON } from './demo';

type SettingsState = {
  baseCleanWon: number;
  passScore: number;
  lockTime: string;
  lockDays: string;
  allowPhone: boolean;
  setBaseCleanWon: (won: number) => void;
  setPassScore: (score: number) => void;
  setLockTime: (time: string) => void;
  setLockDays: (days: string) => void;
  setAllowPhone: (v: boolean) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      baseCleanWon: DEMO_BASE_CLEAN_WON,
      passScore: 70,
      lockTime: '17:00',
      lockDays: '월·수·금',
      allowPhone: true,
      setBaseCleanWon: (won) => set({ baseCleanWon: won }),
      setPassScore: (score) => set({ passScore: score }),
      setLockTime: (time) => set({ lockTime: time }),
      setLockDays: (days) => set({ lockDays: days }),
      setAllowPhone: (v) => set({ allowPhone: v }),
    }),
    { name: 'chungsora-settings-v1' },
  ),
);
