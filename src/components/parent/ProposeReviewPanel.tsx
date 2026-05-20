'use client';

import { useEffect, useState } from 'react';
import {
  acceptParentProposal,
  fetchParentProposals,
  rejectParentProposal,
  fetchFamilySummary,
} from '@/lib/chungsora/clientApi';
import { getPendingThread, useProposeStore } from '@/lib/chungsora/proposeStore';
import { WON_PER_P } from '@/lib/chungsora/tokens';
import { ProposeHistoryButton, ProposeHistoryDrawer } from '@/components/chungsora/ProposeHistoryDrawer';

export function ProposeReviewPanel() {
  const threads = useProposeStore((s) => s.threads);
  const setThreads = useProposeStore((s) => s.setThreads);
  const savedRejectReasons = useProposeStore((s) => s.savedRejectReasons);
  const acceptThread = useProposeStore((s) => s.acceptThread);
  const rejectThread = useProposeStore((s) => s.rejectThread);
  const saveRejectReason = useProposeStore((s) => s.saveRejectReason);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [childName, setChildName] = useState('자녀');

  useEffect(() => {
    void fetchParentProposals()
      .then((res) => {
        if (res.threads?.length) setThreads(res.threads);
      })
      .catch(() => undefined);
    void fetchFamilySummary()
      .then((s) => setChildName(s.child_display_name))
      .catch(() => undefined);
  }, [setThreads]);

  const pending = getPendingThread(threads);

  const handleAccept = async () => {
    if (!pending) return;
    try {
      await acceptParentProposal(pending.id);
      acceptThread(pending.id);
      const res = await fetchParentProposals();
      if (res.threads) setThreads(res.threads);
    } catch {
      acceptThread(pending.id);
    }
  };

  const handleReject = async () => {
    if (!pending) return;
    const trimmed = reason.trim() || '사유 없음';
    try {
      await rejectParentProposal(pending.id, trimmed);
      rejectThread(pending.id, trimmed);
      const res = await fetchParentProposals();
      if (res.threads) setThreads(res.threads);
    } catch {
      rejectThread(pending.id, trimmed);
    }
    if (reason.trim()) saveRejectReason(reason.trim());
    setRejectOpen(false);
    setReason('');
  };

  return (
    <>
      <header className="flex items-center justify-between px-5 pb-2 pt-6">
        <div>
          <h1 className="text-[22px] font-bold text-[#2f3438]">제안하기</h1>
          <p className="mt-1 text-[13px] text-[#828c94]">자녀 P 사용 제안 · 수락 시 P상점 등록</p>
        </div>
        <ProposeHistoryButton onClick={() => setHistoryOpen(true)} />
      </header>

      <div className="px-5 pb-6">
        {!pending ? (
          <div className="ch-card px-4 py-8 text-center">
            <p className="text-sm font-medium text-[#828c94]">대기 중인 제안이 없어요</p>
            <p className="mt-1 text-xs text-[#adb5bd]">💬 에서 지난 대화를 볼 수 있어요</p>
          </div>
        ) : (
          <div className="ch-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#2f3438]">{childName}의 포인트 사용 제안</span>
              <span className="rounded-full bg-[#e8f8fb] px-2.5 py-1 text-[11px] font-bold text-[#00b8cf]">협의 중</span>
            </div>
            <p className="mt-3 text-lg font-bold text-[#2f3438]">{pending.label}</p>
            <p className="mt-1 text-sm font-bold text-[#00b8cf]">
              {pending.points}P · {(pending.points * WON_PER_P).toLocaleString()}원 상당
            </p>

            {rejectOpen ? (
              <div className="mt-4 border-t border-[#f0f2f4] pt-4">
                <p className="text-sm font-semibold text-[#2f3438]">거절 사유</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {savedRejectReasons.map((phrase) => (
                    <button
                      key={phrase}
                      type="button"
                      onClick={() => setReason(phrase)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                        reason === phrase ? 'bg-[#e8f8fb] text-[#00b8cf] ring-1 ring-[#00b8cf]' : 'bg-[#f7f9fa] text-[#2f3438]'
                      }`}
                    >
                      {phrase}
                    </button>
                  ))}
                </div>
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="직접 입력"
                  className="mt-3 w-full rounded-xl border border-[#eaedef] px-4 py-3 text-sm outline-none focus:border-[#00b8cf]"
                />
                <button
                  type="button"
                  onClick={() => saveRejectReason(reason)}
                  className="mt-2 w-full rounded-xl border border-[#eaedef] py-2.5 text-xs font-semibold text-[#828c94]"
                >
                  자주 쓰는 문구 저장
                </button>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => { setRejectOpen(false); setReason(''); }} className="ch-btn-secondary flex-1 py-3.5 text-sm">
                    취소
                  </button>
                  <button type="button" onClick={() => void handleReject()} className="flex-1 rounded-xl bg-[#2f3438] py-3.5 text-sm font-bold text-white">
                    거절 보내기
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => void handleAccept()} className="ch-btn-primary flex-1 py-3.5 text-sm">
                  수락
                </button>
                <button type="button" onClick={() => setRejectOpen(true)} className="ch-btn-secondary flex-1 py-3.5 text-sm">
                  거절
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <ProposeHistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </>
  );
}
