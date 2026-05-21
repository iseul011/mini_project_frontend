'use client';

import { create } from 'zustand';

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
  activeThreadId: string | null;
  setThreads: (threads: ProposalThread[]) => void;
};

export const useProposeStore = create<ProposeState>()((set) => ({
  threads: [],
  activeThreadId: null,
  setThreads: (threads) => {
    const pending = threads.find((t) => t.status === 'pending');
    set({ threads, activeThreadId: pending?.id ?? threads[0]?.id ?? null });
  },
}));

export function getPendingThread(threads: ProposalThread[]) {
  return threads.find((t) => t.status === 'pending') ?? null;
}

export function getLatestChildThread(threads: ProposalThread[]) {
  return threads[0] ?? null;
}

/** Neon propose_threads 거절 이력에서 사유 칩 추출 */
export function collectRejectReasons(threads: ProposalThread[]): string[] {
  const reasons = threads.flatMap((t) =>
    t.messages
      .filter((m) => m.kind === 'reject' && m.reason?.trim())
      .map((m) => m.reason!.trim()),
  );
  return [...new Set(reasons)].slice(0, 6);
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
