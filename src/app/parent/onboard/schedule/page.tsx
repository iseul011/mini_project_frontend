'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PassScoreControl } from '@/components/chungsora/PassScoreControl';
import { updateLockPolicy, updateFamilyProfile } from '@/lib/chungsora/clientApi';
import { useAuthStore } from '@/lib/chungsora/authStore';
import { useSettingsStore } from '@/lib/chungsora/settingsStore';

export default function ParentSchedulePage() {
  const router = useRouter();
  const setOnboardDone = useAuthStore((s) => s.setOnboardDone);
  const lockTime = useSettingsStore((s) => s.lockTime);
  const lockDays = useSettingsStore((s) => s.lockDays);
  const passScore = useSettingsStore((s) => s.passScore);
  const setLockTime = useSettingsStore((s) => s.setLockTime);
  const setLockDays = useSettingsStore((s) => s.setLockDays);
  const setPassScore = useSettingsStore((s) => s.setPassScore);

  const finish = () => {
    setOnboardDone(true);
    void updateLockPolicy({ lock_time: lockTime, lock_days: lockDays, pass_score: passScore }).catch(
      () => undefined,
    );
    void updateFamilyProfile({ onboard_done: true, lock_time: lockTime, lock_days: lockDays, pass_score: passScore }).catch(
      () => undefined,
    );
    router.push('/parent/onboard/flow');
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-5 py-10">
      <Link href="/parent/onboard/baseline" className="text-xs font-semibold text-[#00b8cf]">
        ← 뒤로
      </Link>
      <h1 className="mt-4 text-[26px] font-bold text-[#2f3438]">청소 시간 · 합격점</h1>
      <p className="mt-2 text-sm text-[#828c94]">잠금 시간과 AI 합격 점수를 설정해요</p>

      <div className="ch-card mt-8 space-y-6 p-5">
        <div>
          <label className="text-sm font-bold text-[#2f3438]">잠금 요일</label>
          <input
            value={lockDays}
            onChange={(e) => setLockDays(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[#eaedef] px-4 py-3 text-sm outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-bold text-[#2f3438]">잠금 시작 시간</label>
          <input
            type="time"
            value={lockTime}
            onChange={(e) => setLockTime(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[#eaedef] px-4 py-3 text-sm outline-none"
          />
        </div>
        <div>
          <PassScoreControl value={passScore} onChange={setPassScore} />
          <p className="mt-1 text-xs text-[#828c94]">이 점수 이상이면 잠금 해제 · 포인트 지급</p>
        </div>
      </div>

      <button type="button" onClick={finish} className="ch-btn-primary mt-8 py-4 text-[15px]">
        설정 완료
      </button>
    </div>
  );
}
