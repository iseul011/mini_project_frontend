'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { earnPoints } from '@/lib/chungsora/clientApi';
import { useCleaningSessionStore } from '@/lib/chungsora/cleaningSessionStore';
import { useSettingsStore } from '@/lib/chungsora/settingsStore';
import { calcCleaningPayout } from '@/lib/chungsora/tokens';

export default function ChildUnlockPage() {
  const router = useRouter();
  const cleanliness = useCleaningSessionStore((s) => s.cleanliness);
  const verifyComment = useCleaningSessionStore((s) => s.verifyComment);
  const streakDays = useCleaningSessionStore((s) => s.streakDays);
  const resetSession = useCleaningSessionStore((s) => s.resetSession);
  const baseCleanWon = useSettingsStore((s) => s.baseCleanWon);
  const passScore = useSettingsStore((s) => s.passScore);

  const score = cleanliness;
  const passed = score > 0 && score >= passScore;
  const payout = calcCleaningPayout(baseCleanWon, score || 0, streakDays);

  useEffect(() => {
    if (cleanliness <= 0) {
      router.replace('/child/after');
    }
  }, [cleanliness, router]);

  useEffect(() => {
    if (!passed) return;
    void earnPoints(payout.finalP, `청소 완료 · AI ${score}점`).catch(() => undefined);
  }, [passed, payout.finalP, score]);

  const goHome = () => {
    resetSession();
    router.push('/child/home');
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center bg-[#f7f9fa] px-6 py-10 text-center">
      <p className="text-5xl">{passed ? '🔓' : '⏳'}</p>
      <h1 className="mt-4 text-2xl font-bold text-[#2f3438]">
        {passed ? '잠금 해제!' : score <= 0 ? 'AI 채점 필요' : '점수 미달'}
      </h1>
      <p className="mt-2 text-sm text-[#828c94]">{verifyComment || 'AI 검증 완료'}</p>

      <div className="ch-card mt-8 w-full p-5 text-left">
        <p className="text-sm font-bold text-[#2f3438]">AI {score}점</p>
        <div className="mt-3 space-y-2 text-sm text-[#828c94]">
          <div className="flex justify-between">
            <span>
              기본 {baseCleanWon.toLocaleString()}원 × {score}%
            </span>
            <span>{payout.wonFromScore.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between">
            <span>
              스트릭 {streakDays}일 ({payout.mult}×)
            </span>
            <span className="font-bold text-[#00b8cf]">+{payout.finalP}P</span>
          </div>
        </div>
      </div>

      {passed ? (
        <button type="button" onClick={goHome} className="ch-btn-primary mt-8 w-full max-w-xs py-4 text-[15px]">
          홈으로
        </button>
      ) : (
        <Link href="/child/dirty" className="ch-btn-primary mt-8 block w-full max-w-xs py-4 text-[15px]">
          다시 청소하기
        </Link>
      )}
    </div>
  );
}
