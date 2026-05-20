'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ProposalStatus = 'pending' | 'accepted' | 'rejected';

export type ProposalMessage = {
  id: string;
  role: 'child' | 'parent';
  kind: 'proposal' | 'accept' | 'reject';
  label: string;
  points: number;
  reason?: string;
  at: string;
};

export type ProposalThread = {
  id: string;
  label: string;
  points: number;
  status: ProposalStatus;
  messages: ProposalMessage[];
  updatedAt: string;
};

type ProposeState = {
  threads: ProposalThread[];
  savedRejectReasons: string[];
  activeThreadId: string | null;
  setThreads: (threads: ProposalThread[]) => void;
  submitProposal: (label: string, points: number) => string;
  acceptThread: (threadId: string) => void;
  rejectThread: (threadId: string, reason: string) => void;
  saveRejectReason: (reason: string) => void;
};

export const useProposeStore = create<ProposeState>()(
  persist(
    (set, get) => ({
      threads: [],
      savedRejectReasons: [
        '이번 달 예산 초과',
        '점수 더 올리면 OK',
        '다음 주에 다시 제안해줘',
      ],
      activeThreadId: null,

      setThreads: (threads) => {
        const pending = threads.find((t) => t.status === 'pending');
        set({ threads, activeThreadId: pending?.id ?? threads[0]?.id ?? null });
      },

      submitProposal: (label, points) => {
        const at = new Date().toISOString();
        const id = `prop-${Date.now()}`;
        const thread: ProposalThread = {
          id,
          label,
          points,
          status: 'pending',
          updatedAt: at,
          messages: [
            {
              id: `m-${Date.now()}`,
              role: 'child',
              kind: 'proposal',
              label,
              points,
              at,
            },
          ],
        };
        set((s) => ({
          threads: [thread, ...s.threads],
          activeThreadId: id,
        }));
        return id;
      },

      acceptThread: (threadId) => {
        const at = new Date().toISOString();
        set((s) => ({
          threads: s.threads.map((t) =>
            t.id !== threadId
              ? t
              : {
                  ...t,
                  status: 'accepted' as const,
                  updatedAt: at,
                  messages: [
                    ...t.messages,
                    {
                      id: `accept-${Date.now()}`,
                      role: 'parent' as const,
                      kind: 'accept' as const,
                      label: t.label,
                      points: t.points,
                      at,
                    },
                  ],
                },
          ),
          activeThreadId: null,
        }));
      },

      rejectThread: (threadId, reason) => {
        const at = new Date().toISOString();
        set((s) => ({
          threads: s.threads.map((t) =>
            t.id !== threadId
              ? t
              : {
                  ...t,
                  status: 'rejected' as const,
                  updatedAt: at,
                  messages: [
                    ...t.messages,
                    {
                      id: `reject-${Date.now()}`,
                      role: 'parent' as const,
                      kind: 'reject' as const,
                      label: t.label,
                      points: t.points,
                      reason,
                      at,
                    },
                  ],
                },
          ),
          activeThreadId: null,
        }));
      },

      saveRejectReason: (reason) => {
        const trimmed = reason.trim();
        if (!trimmed) return;
        set((s) => ({
          savedRejectReasons: [trimmed, ...s.savedRejectReasons.filter((r) => r !== trimmed)].slice(
            0,
            6,
          ),
        }));
      },
    }),
    { name: 'chungsora-propose-v1' },
  ),
);

export function getPendingThread(threads: ProposalThread[]) {
  return threads.find((t) => t.status === 'pending') ?? null;
}

export function getLatestChildThread(threads: ProposalThread[]) {
  return threads[0] ?? null;
}

export function formatProposalDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
