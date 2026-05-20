'use client';

import { X } from 'lucide-react';
import { formatProposalDate, useProposeStore, type ProposalThread } from '@/lib/chungsora/proposeStore';
import { WON_PER_P } from '@/lib/chungsora/tokens';

function statusLabel(status: ProposalThread['status']) {
  if (status === 'accepted') return '수락';
  if (status === 'rejected') return '거절';
  return '협의 중';
}

function statusColor(status: ProposalThread['status']) {
  if (status === 'accepted') return 'text-[#00c73c] bg-[#e8f9ee]';
  if (status === 'rejected') return 'text-[#f04452] bg-[#fff0f1]';
  return 'text-[#00b8cf] bg-[#e8f8fb]';
}

export function ProposeHistoryDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const threads = useProposeStore((s) => s.threads);
  if (!open) return null;

  const sorted = [...threads].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40" onClick={onClose}>
      <div
        className="mx-auto flex max-h-[85dvh] w-full max-w-lg flex-col rounded-t-[20px] bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#eaedef] px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-[#2f3438]">💬 제안 대화 기록</h2>
            <p className="mt-0.5 text-xs text-[#828c94]">자녀 제안 · 부모 응답 내역</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-[#828c94] hover:bg-[#f7f9fa]">
            <X size={22} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {sorted.length === 0 ? (
            <p className="py-12 text-center text-sm text-[#828c94]">아직 대화 기록이 없어요</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {sorted.map((thread) => (
                <li key={thread.id} className="ch-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-[#2f3438]">{thread.label}</p>
                      <p className="mt-0.5 text-sm font-semibold text-[#00b8cf]">
                        {thread.points}P · {(thread.points * WON_PER_P).toLocaleString()}원
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${statusColor(thread.status)}`}>
                      {statusLabel(thread.status)}
                    </span>
                  </div>
                  <ul className="mt-3 flex flex-col gap-2 border-t border-[#f0f2f4] pt-3">
                    {thread.messages.map((m) => (
                      <li key={m.id} className="text-sm">
                        <div className="flex items-center gap-2 text-[11px] text-[#adb5bd]">
                          <span>{m.role === 'child' ? '자녀' : '부모'}</span>
                          <span>{formatProposalDate(m.at)}</span>
                        </div>
                        {m.kind === 'proposal' && (
                          <p className="mt-0.5 text-[#2f3438]">「{m.label}」 {m.points}P 사용 제안</p>
                        )}
                        {m.kind === 'accept' && (
                          <p className="mt-0.5 font-medium text-[#00c73c]">수락 · P상점 등록</p>
                        )}
                        {m.kind === 'reject' && (
                          <p className="mt-0.5 text-[#f04452]">거절{m.reason ? ` · ${m.reason}` : ''}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProposeHistoryButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="제안 대화 기록"
      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0f2f4] text-xl transition-colors hover:bg-[#eaedef]"
    >
      💬
    </button>
  );
}
