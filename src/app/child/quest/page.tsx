'use client';

import Link from 'next/link';
import { useCleaningSessionStore } from '@/lib/chungsora/cleaningSessionStore';

export default function ChildQuestPage() {
  const questItems = useCleaningSessionStore((s) => s.questItems);
  const phase = useCleaningSessionStore((s) => s.phase);

  const inSession = phase === 'quest' || phase === 'scanning';

  return (
    <>
      <header className="px-5 pb-2 pt-4">
        <h1 className="text-[22px] font-bold text-[#2f3438]">청소 리스트</h1>
        <p className="mt-1 text-[13px] text-[#828c94]">방 촬영 후 AI가 찾은 정리 항목</p>
      </header>

      <div className="flex flex-col gap-3 px-5 pb-6">
        {(inSession ? questItems : questItems).map((item) => (
          <div key={item.id} className="ch-card flex items-center justify-between p-4">
            <span className="text-sm font-medium text-[#2f3438]">{item.label}</span>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${item.done ? 'bg-[#e8f9ee] text-[#00c73c]' : 'bg-[#f0f2f4] text-[#828c94]'}`}>
              {item.done ? '완료' : '남음'}
            </span>
          </div>
        ))}

        {inSession ? (
          <Link href="/child/quest/session" className="ch-btn-primary mt-2 block py-4 text-center text-sm">
            세션 계속하기 →
          </Link>
        ) : (
          <p className="mt-2 rounded-xl bg-[#f0f2f4] px-4 py-3 text-xs text-[#828c94]">
            홈에서 「일일 퀘스트 시작하기」로 촬영 · AI scan 후 세션 리스트가 생성돼요
          </p>
        )}
      </div>
    </>
  );
}
