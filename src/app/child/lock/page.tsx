'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { fetchLockPolicy } from '@/lib/chungsora/clientApi';
import { useCleaningSessionStore } from '@/lib/chungsora/cleaningSessionStore';
import { useSettingsStore } from '@/lib/chungsora/settingsStore';

export default function ChildLockPage() {
  const allowPhone = useSettingsStore((s) => s.allowPhone);
  const lockTime = useSettingsStore((s) => s.lockTime);
  const setLockTime = useSettingsStore((s) => s.setLockTime);
  const setLockDays = useSettingsStore((s) => s.setLockDays);
  const setPassScore = useSettingsStore((s) => s.setPassScore);
  const setAllowPhone = useSettingsStore((s) => s.setAllowPhone);
  const setPhase = useCleaningSessionStore((s) => s.setPhase);

  useEffect(() => {
    const sync = () => {
      void fetchLockPolicy()
        .then((p) => {
          setLockTime(p.lock_time);
          setLockDays(p.lock_days);
          setPassScore(p.pass_score);
          setAllowPhone(p.allow_phone);
        })
        .catch(() => undefined);
    };
    sync();
    const t = setInterval(sync, 60_000);
    return () => clearInterval(t);
  }, [setLockTime, setLockDays, setPassScore, setAllowPhone]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center bg-[#2f3438] px-6 text-center text-white">
      <p className="rounded-full bg-[#f04452] px-4 py-1 text-xs font-bold">잠금 ON</p>
      <p className="mt-6 text-4xl">🔒</p>
      <h1 className="mt-4 text-xl font-bold">방 청소하면 폰이 풀려요</h1>
      <p className="mt-2 text-sm text-white/70">유튜브 · 게임 · 카톡 차단됨 · {lockTime}부터</p>
      {allowPhone && (
        <p className="mt-3 text-xs text-white/50">전화 · 긴급번호는 사용 가능</p>
      )}
      <Link
        href="/child/dirty"
        onClick={() => setPhase('dirty')}
        className="ch-btn-primary mt-10 block w-full max-w-xs py-4 text-center text-[15px]"
      >
        청소 시작
      </Link>
    </div>
  );
}
