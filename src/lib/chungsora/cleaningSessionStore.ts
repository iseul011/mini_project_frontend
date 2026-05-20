'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type QuestItem = { id: string; label: string; done: boolean };

export type SessionPhase =
  | 'idle'
  | 'dirty'
  | 'scanning'
  | 'quest'
  | 'after'
  | 'verifying'
  | 'unlock';

type CleaningSessionState = {
  phase: SessionPhase;
  questItems: QuestItem[];
  pollutionLevel: number;
  scanSummary: string;
  cleanliness: number;
  verifyComment: string;
  streakDays: number;
  setPhase: (phase: SessionPhase) => void;
  setScanResult: (items: QuestItem[], pollution: number, summary: string) => void;
  toggleQuestItem: (id: string) => void;
  setVerifyResult: (cleanliness: number, comment: string) => void;
  resetSession: () => void;
  allQuestDone: () => boolean;
};

const DEMO_ITEMS: QuestItem[] = [
  { id: '1', label: '바닥 옷 치우기', done: false },
  { id: '2', label: '책상 정리', done: false },
  { id: '3', label: '쓰레기 버리기', done: false },
];

export const useCleaningSessionStore = create<CleaningSessionState>()(
  persist(
    (set, get) => ({
      phase: 'idle',
      questItems: DEMO_ITEMS,
      pollutionLevel: 72,
      scanSummary: '방에 정리할 물건이 몇 가지 보여요.',
      cleanliness: 0,
      verifyComment: '',
      streakDays: 5,
      setPhase: (phase) => set({ phase }),
      setScanResult: (items, pollution, summary) =>
        set({ questItems: items, pollutionLevel: pollution, scanSummary: summary, phase: 'quest' }),
      toggleQuestItem: (id) =>
        set((s) => ({
          questItems: s.questItems.map((q) => (q.id === id ? { ...q, done: !q.done } : q)),
        })),
      setVerifyResult: (cleanliness, comment) =>
        set({ cleanliness, verifyComment: comment, phase: 'unlock' }),
      resetSession: () =>
        set({
          phase: 'idle',
          questItems: DEMO_ITEMS.map((q) => ({ ...q, done: false })),
          cleanliness: 0,
          verifyComment: '',
        }),
      allQuestDone: () => get().questItems.every((q) => q.done),
    }),
    { name: 'chungsora-session-v1' },
  ),
);
