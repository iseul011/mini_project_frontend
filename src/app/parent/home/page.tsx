'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CleaningCalendar } from '@/components/chungsora/CleaningCalendar';
import { CardHeader } from '@/components/chungsora/CardHeader';
import { wonToP } from '@/lib/chungsora/tokens';
import { fetchFamilySummary, type FamilySummary } from '@/lib/chungsora/clientApi';

export default function ParentHomePage() {
  const router = useRouter();
  const [summary, setSummary] = useState<FamilySummary | null>(null);

  useEffect(() => {
    void fetchFamilySummary()
      .then(setSummary)
      .catch(() => undefined);
  }, []);

  const lockTime = summary?.lock_time ?? '17:00';
  const lockDays = summary?.lock_days ?? '월·수·금';
  const baseCleanWon = summary?.base_clean_won ?? 1000;
  const points = summary?.points_balance ?? 0;
  const childName = summary?.child_display_name ?? '자녀';
  const streak = summary?.streak_days ?? 0;

  return (
    <>
      <header className="flex items-center justify-between px-5 pb-2 pt-4">
        <h1 className="text-[22px] font-bold text-[#2f3438]">청소해라</h1>
        <span className="rounded-full bg-[#fff4e6] px-3 py-1 text-xs font-bold text-[#ff9f0a]">
          {lockTime} 잠금
        </span>
      </header>

      <div className="flex flex-col gap-4 px-5 pb-6">
        <div className="ch-card p-4">
          <CardHeader
            title={childName}
            subtitle={`${points}P · 스트릭 ${streak}일`}
            pill={summary?.today_score ? '완료' : '대기'}
          />
        </div>

        <div>
          <button
            type="button"
            onClick={() => router.push('/parent/rewards?addQuest=1')}
            className="ch-btn-primary w-full py-4 text-[15px]"
          >
            일일 퀘스트 추가하기
          </button>
          <p className="mt-2 text-center text-xs font-medium text-[#828c94]">
            {lockDays} {lockTime} 잠금
          </p>
        </div>

        <div className="border-t border-[#eaedef] pt-4">
          <h2 className="mb-3 text-sm font-bold text-[#2f3438]">청소 로그</h2>
          <CleaningCalendar role="parent" points={points} />
        </div>

        <p className="text-xs text-[#adb5bd]">
          청소 1회 기본 {baseCleanWon.toLocaleString()}원 · AI 점수%만큼 지급 · 예: 90점 →{' '}
          {wonToP(Math.floor(baseCleanWon * 0.9))}P
        </p>
      </div>
    </>
  );
}
