'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useCleaningSessionStore } from '@/lib/chungsora/cleaningSessionStore';

export default function ChildMissionQuestPage() {
  const router = useRouter();
  const questItems = useCleaningSessionStore((s) => s.questItems);
  const scanSummary = useCleaningSessionStore((s) => s.scanSummary);
  const hasScanResult = useCleaningSessionStore((s) => s.hasScanResult);
  const toggleQuestItem = useCleaningSessionStore((s) => s.toggleQuestItem);
  const allQuestDone = useCleaningSessionStore((s) => s.allQuestDone);
  const setPhase = useCleaningSessionStore((s) => s.setPhase);

  useEffect(() => {
    setPhase('quest');
    if (!hasScanResult || questItems.length === 0) {
      router.replace('/child/mission/before');
    }
  }, [hasScanResult, questItems.length, router, setPhase]);

  const done = allQuestDone();

  return (
    <div className="mx-auto flex min-h-0 flex-1 max-w-lg flex-col px-5 py-6">
      <h1 className="text-lg font-bold text-[#1a1e22]">청소하기</h1>
      <p className="mt-1 text-sm text-[#8e8e8e]">{scanSummary || 'AI가 찾은 정리 항목을 하나씩 해 주세요.'}</p>

      <div className="mt-4 flex flex-col gap-3">
        {questItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => toggleQuestItem(item.id)}
            className="ch-card flex items-center justify-between p-4 text-left"
          >
            <span className={`text-sm font-medium ${item.done ? 'text-[#8e8e8e] line-through' : 'text-[#1a1e22]'}`}>
              {item.label}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${item.done ? 'bg-[#e8f9ee] text-[#00c73c]' : 'bg-[#f0f2f4] text-[#8e8e8e]'}`}
            >
              {item.done ? '완료' : '남음'}
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={!done}
        onClick={() => router.push('/child/mission/after')}
        className="ch-btn-primary mt-8 py-4 text-[15px] disabled:opacity-40"
      >
        다 했어요 · 청소 후 사진
      </button>
    </div>
  );
}
