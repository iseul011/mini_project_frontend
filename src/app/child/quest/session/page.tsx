'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useCleaningSessionStore } from '@/lib/chungsora/cleaningSessionStore';

export default function ChildQuestSessionPage() {
  const router = useRouter();
  const questItems = useCleaningSessionStore((s) => s.questItems);
  const scanSummary = useCleaningSessionStore((s) => s.scanSummary);
  const hasScanResult = useCleaningSessionStore((s) => s.hasScanResult);
  const toggleQuestItem = useCleaningSessionStore((s) => s.toggleQuestItem);
  const allQuestDone = useCleaningSessionStore((s) => s.allQuestDone);

  useEffect(() => {
    if (!hasScanResult || questItems.length === 0) {
      router.replace('/child/dirty');
    }
  }, [hasScanResult, questItems.length, router]);

  const done = allQuestDone();

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-5 py-6">
      <h1 className="text-[22px] font-bold text-[#2f3438]">청소 리스트</h1>
      <p className="mt-1 text-[13px] text-[#828c94]">{scanSummary}</p>

      <div className="mt-4 flex flex-col gap-3">
        {questItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => toggleQuestItem(item.id)}
            className="ch-card flex items-center justify-between p-4 text-left"
          >
            <span className={`text-sm font-medium ${item.done ? 'text-[#828c94] line-through' : 'text-[#2f3438]'}`}>
              {item.label}
            </span>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${item.done ? 'bg-[#e8f9ee] text-[#00c73c]' : 'bg-[#f0f2f4] text-[#828c94]'}`}>
              {item.done ? '완료' : '남음'}
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={!done}
        onClick={() => router.push('/child/after')}
        className="ch-btn-primary mt-8 py-4 text-[15px] disabled:opacity-40"
      >
        다 찾았어요 → after 촬영
      </button>

      <Link href="/child/quest" className="mt-3 text-center text-xs text-[#828c94]">
        퀘스트 탭으로
      </Link>
    </div>
  );
}
