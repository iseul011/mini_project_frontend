'use client';

import { useEffect, useState } from 'react';
import { fetchChildProposals, submitChildProposal, fetchPointsBalance } from '@/lib/chungsora/clientApi';
import {
  getLatestChildThread,
  getPendingThread,
  useProposeStore,
} from '@/lib/chungsora/proposeStore';
import { PROPOSAL_EVERY_P, WON_PER_P } from '@/lib/chungsora/tokens';
import { ProposeHistoryButton, ProposeHistoryDrawer } from '@/components/chungsora/ProposeHistoryDrawer';

const PT_OPTIONS = [100, 150, 200, 250, 300];

export function ChildProposeSendPanel() {
  const threads = useProposeStore((s) => s.threads);
  const setThreads = useProposeStore((s) => s.setThreads);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [label, setLabel] = useState('');
  const [points, setPoints] = useState(150);
  const [sending, setSending] = useState(false);
  const [proposalTokens, setProposalTokens] = useState(0);

  useEffect(() => {
    void fetchChildProposals()
      .then((res) => {
        if (res.threads?.length) setThreads(res.threads);
      })
      .catch(() => undefined);
    void fetchPointsBalance()
      .then((b) => setProposalTokens(Math.floor(b.balance / PROPOSAL_EVERY_P)))
      .catch(() => undefined);
  }, [setThreads]);

  const pending = getPendingThread(threads);
  const latest = getLatestChildThread(threads);
  const showForm = !pending;

  const handleSubmit = async () => {
    const trimmed = label.trim();
    if (!trimmed) {
      setSubmitError('보상 내용을 입력해 주세요.');
      return;
    }
    setSending(true);
    setSubmitError('');
    try {
      await submitChildProposal(trimmed, points);
      const list = await fetchChildProposals();
      if (list.threads) setThreads(list.threads);
      setLabel('');
    } catch {
      setSubmitError('제안 전송에 실패했습니다. 다시 시도해 주세요.');
    }
    setSending(false);
  };

  const statusThread = pending ?? latest;

  return (
    <>
      <header className="flex items-center justify-between px-5 pb-2 pt-6">
        <div>
          <h1 className="text-[22px] font-bold text-[#2f3438]">제안하기</h1>
          <p className="mt-1 text-[13px] text-[#828c94]">포인트 사용 보상 · 부모 수락 시 P상점 등록</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#e8f8fb] px-2.5 py-1 text-[11px] font-bold text-[#00b8cf]">
            🤝 {proposalTokens}회
          </span>
          <ProposeHistoryButton onClick={() => setHistoryOpen(true)} />
        </div>
      </header>

      <div className="px-5 pb-6">
        {statusThread && (
          <div className="ch-card mb-4 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#2f3438]">내가 보낸 제안</span>
              <span className="rounded-full bg-[#f0f2f4] px-2.5 py-1 text-[11px] font-bold text-[#828c94]">
                {statusThread.status === 'pending' ? '협의 중' : statusThread.status === 'accepted' ? '수락됨' : '거절됨'}
              </span>
            </div>
            <p className="mt-2 font-bold text-[#2f3438]">{statusThread.label}</p>
            <p className="mt-1 text-sm font-bold text-[#00b8cf]">
              {statusThread.points}P · {(statusThread.points * WON_PER_P).toLocaleString()}원
            </p>
            {statusThread.status === 'pending' && (
              <p className="mt-3 rounded-xl bg-[#f0f2f4] px-3 py-2 text-xs text-[#828c94]">아빠/엄마 확인 중…</p>
            )}
            {statusThread.status === 'accepted' && (
              <p className="mt-3 text-xs font-medium text-[#00c73c]">P상점에 등록됐어요!</p>
            )}
            {statusThread.status === 'rejected' && (
              <p className="mt-3 text-xs text-[#f04452]">
                거절됨 ·{' '}
                {statusThread.messages.find((m) => m.kind === 'reject')?.reason ?? '사유 없음'}
              </p>
            )}
          </div>
        )}

        {showForm && (
          <div className="ch-card p-4">
            <p className="text-sm font-bold text-[#2f3438]">포인트 사용 제안 보내기</p>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="보상 내용 (예: 게임 30분, 아이스크림)"
              className="mt-3 w-full rounded-xl border border-[#eaedef] px-4 py-3 text-sm outline-none focus:border-[#00b8cf]"
            />
            <p className="mt-3 text-xs text-[#828c94]">사용할 포인트</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PT_OPTIONS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPoints(p)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                    points === p ? 'bg-[#e8f8fb] text-[#00b8cf] ring-1 ring-[#00b8cf]' : 'border border-[#eaedef] text-[#828c94]'
                  }`}
                >
                  {p}P
                </button>
              ))}
            </div>
            {submitError && <p className="mt-3 text-sm text-[#e03131]">{submitError}</p>}
            <button
              type="button"
              disabled={sending || proposalTokens <= 0}
              onClick={() => void handleSubmit()}
              className="ch-btn-primary mt-4 w-full py-3.5 text-sm disabled:opacity-60"
            >
              {sending ? '보내는 중…' : proposalTokens <= 0 ? '제안권 부족' : '제안 보내기'}
            </button>
          </div>
        )}
      </div>

      <ProposeHistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </>
  );
}
