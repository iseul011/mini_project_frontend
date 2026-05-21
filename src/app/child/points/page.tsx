'use client';

import { useCallback, useEffect, useState } from 'react';
import { wonToP, WON_PER_P } from '@/lib/chungsora/tokens';
import { fetchPointsBalance, spendPoints, fetchShopRewards, type ShopReward } from '@/lib/chungsora/clientApi';
import { deferEffect } from '@/lib/react/deferEffect';

export default function ChildPointsPage() {
  const [balance, setBalance] = useState(0);
  const [rewards, setRewards] = useState<ShopReward[]>([]);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    try {
      const [b, shop] = await Promise.all([fetchPointsBalance(), fetchShopRewards()]);
      setBalance(b.balance);
      setRewards(shop.rewards);
    } catch {
      /* empty */
    }
  }, []);

  useEffect(() => {
    deferEffect(() => {
      void load();
    });
  }, [load]);

  const redeem = async (r: ShopReward) => {
    const cost = wonToP(r.won);
    if (balance < cost) {
      setToast('P가 부족해요');
      setTimeout(() => setToast(''), 2500);
      return;
    }
    try {
      const res = await spendPoints(r.won, r.label);
      setBalance(res.balance);
      setToast(`${r.label} 사용 완료! (-${cost}P)`);
    } catch {
      setToast('교환에 실패했어요');
    }
    setTimeout(() => setToast(''), 2500);
  };

  return (
    <>
      <header className="flex items-center justify-between px-5 pb-2 pt-4">
        <h1 className="text-[22px] font-bold text-[#2f3438]">P상점</h1>
        <div className="text-right">
          <p className="text-lg font-extrabold text-[#00b8cf]">{balance}P</p>
          <p className="text-[10px] text-[#828c94]">≈ {(balance * WON_PER_P).toLocaleString()}원</p>
        </div>
      </header>

      <div className="flex flex-col gap-3 px-5 pb-6">
        {rewards.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => void redeem(r)}
            className="ch-card flex items-center justify-between p-4 text-left"
          >
            <div>
              <p className="text-sm font-bold text-[#2f3438]">{r.label}</p>
              <p className="text-xs text-[#828c94]">{r.won.toLocaleString()}원 · {wonToP(r.won)}P</p>
            </div>
            <span className="text-xs font-bold text-[#00b8cf]">교환</span>
          </button>
        ))}
      </div>

      {toast ? (
        <p className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#2f3438] px-4 py-2 text-xs text-white">
          {toast}
        </p>
      ) : null}
    </>
  );
}
