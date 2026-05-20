'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CleaningCalendar } from '@/components/chungsora/CleaningCalendar';
import { WON_PER_P } from '@/lib/chungsora/tokens';
import { fetchFamilySummary, fetchDailyQuests, type FamilySummary, type DailyQuest } from '@/lib/chungsora/clientApi';

export default function ChildHomePage() {
  const router = useRouter();
  const [summary, setSummary] = useState<FamilySummary | null>(null);
  const [quests, setQuests] = useState<DailyQuest[]>([]);

  useEffect(() => {
    void fetchFamilySummary()
      .then(setSummary)
      .catch(() => undefined);
    void fetchDailyQuests()
      .then((r) => setQuests(r.quests))
      .catch(() => undefined);
  }, []);

  const name = summary?.child_display_name ?? '자녀';
  const points = summary?.points_balance ?? 0;
  const streak = summary?.streak_days ?? 0;
  const mult = summary?.streak_mult ?? 1;

  return (
    <>
      <header className="flex items-center justify-between px-5 pb-2 pt-4">
        <h1 className="text-[22px] font-bold text-[#2f3438]">안녕, {name}</h1>
        <span className="text-sm font-bold text-[#00b8cf]">
          {points}P · ≈{(points * WON_PER_P).toLocaleString()}원
        </span>
      </header>

      <div className="flex flex-col gap-4 px-5 pb-6">
        <div className="ch-card p-4">
          <p className="text-sm font-medium text-[#2f3438]">
            {summary?.today_score ? '오늘 청소 완료' : '오늘 청소 대기'}
          </p>
          <p className="mt-1 text-xs text-[#828c94]">
            스트릭 {streak}일 · {mult}× 적용 {streak >= 5 ? '중' : ''}
          </p>
        </div>

        {quests.length > 0 && (
          <div className="ch-card p-4">
            <p className="text-sm font-bold text-[#2f3438]">오늘의 일일 퀘스트</p>
            <ul className="mt-2 space-y-1">
              {quests.map((q) => (
                <li key={q.id} className="text-xs text-[#828c94]">
                  · {q.title}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="button"
          onClick={() => router.push('/child/lock')}
          className="ch-btn-primary block py-4 text-center text-[15px]"
        >
          일일 퀘스트 시작하기
        </button>

        <div className="border-t border-[#eaedef] pt-4">
          <h2 className="mb-3 text-sm font-bold text-[#2f3438]">청소 로그</h2>
          <CleaningCalendar role="child" points={points} />
        </div>
      </div>
    </>
  );
}
