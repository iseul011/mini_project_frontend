'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchFamilySummary, fetchPointsBalance } from '@/lib/chungsora/clientApi';
import { PROPOSAL_EVERY_P, WON_PER_P } from '@/lib/chungsora/tokens';

export default function ChildMePage() {
  const [name, setName] = useState('자녀');
  const [balance, setBalance] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    void fetchFamilySummary()
      .then((s) => {
        setName(s.child_display_name);
        setBalance(s.points_balance);
        setStreak(s.streak_days);
      })
      .catch(() => undefined);
    void fetchPointsBalance()
      .then((b) => setBalance(b.balance))
      .catch(() => undefined);
  }, []);

  const proposalTokens = Math.floor(balance / PROPOSAL_EVERY_P);

  return (
    <>
      <header className="flex items-center justify-between px-5 pb-2 pt-4">
        <h1 className="text-[22px] font-bold text-[#2f3438]">나</h1>
        <div className="text-right">
          <p className="font-bold text-[#00b8cf]">{balance}P</p>
          <p className="text-[10px] text-[#828c94]">≈ {(balance * WON_PER_P).toLocaleString()}원</p>
        </div>
      </header>

      <div className="flex flex-col gap-4 px-5 pb-6">
        <div className="ch-card p-4">
          <p className="text-sm font-medium text-[#2f3438]">스트릭 {streak}일</p>
          <p className="mt-1 text-xs text-[#828c94]">
            🤝 제안 가능 {proposalTokens}회 · 누적 {balance}P (매 {PROPOSAL_EVERY_P}P마다 1회)
          </p>
        </div>
        <div className="ch-card divide-y divide-[#f0f2f4]">
          {[
            ['이름', name],
            ['앱 버전', '1.0.0'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between px-4 py-3.5 text-sm">
              <span className="text-[#2f3438]">{k}</span>
              <span className="text-[#828c94]">{v}</span>
            </div>
          ))}
          <Link href="/child/pair" className="flex justify-between px-4 py-3.5 text-sm text-[#00b8cf]">
            <span>연결 관리</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </>
  );
}
