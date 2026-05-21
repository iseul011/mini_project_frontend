'use client';

import { create } from 'zustand';

/** 세션 중 캐시 — 값은 API(Neon)에서만 채움 */
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

export const useSettingsStore = create<SettingsState>()((set) => ({
  baseCleanWon: 0,
  passScore: 0,
  lockTime: '',
  lockDays: '',
  allowPhone: true,
  setBaseCleanWon: (won) => set({ baseCleanWon: won }),
  setPassScore: (score) => set({ passScore: score }),
  setLockTime: (time) => set({ lockTime: time }),
  setLockDays: (days) => set({ lockDays: days }),
  setAllowPhone: (v) => set({ allowPhone: v }),
}));
