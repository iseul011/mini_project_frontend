'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PassScoreControl } from '@/components/chungsora/PassScoreControl';
import { fetchLockPolicy, updateLockPolicy } from '@/lib/chungsora/clientApi';
import { useSettingsStore } from '@/lib/chungsora/settingsStore';

const ALLOWLIST_OPTIONS = [
  { id: 'dialer', label: '전화 앱' },
  { id: 'com.chungsora.child', label: '청소해라 (자녀)' },
  { id: 'com.android.emergency', label: '긴급 전화' },
];

export default function MoreLockPage() {
  const passScore = useSettingsStore((s) => s.passScore);
  const allowPhone = useSettingsStore((s) => s.allowPhone);
  const setPassScore = useSettingsStore((s) => s.setPassScore);
  const setAllowPhone = useSettingsStore((s) => s.setAllowPhone);
  const [allowlist, setAllowlist] = useState<string[]>(['dialer', 'com.chungsora.child']);

  useEffect(() => {
    fetchLockPolicy()
      .then((p) => {
        setPassScore(p.pass_score);
        setAllowPhone(p.allow_phone);
        setAllowlist(p.allowlist ?? []);
      })
      .catch(() => undefined);
  }, [setPassScore, setAllowPhone]);

  const toggleAllow = (id: string) => {
    setAllowlist((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      void updateLockPolicy({
        pass_score: passScore,
        allow_phone: allowPhone,
        allowlist: next,
      }).catch(() => undefined);
      return next;
    });
  };

  const syncPolicy = () => {
    void updateLockPolicy({
      pass_score: passScore,
      allow_phone: allowPhone,
      allowlist,
    }).catch(() => undefined);
  };

  return (
    <div className="px-5 py-6">
      <Link href="/parent/more" className="text-xs font-semibold text-[#00b8cf]">← 더보기</Link>
      <h1 className="mt-3 text-xl font-bold text-[#2f3438]">잠금 설정</h1>
      <p className="mt-1 text-xs text-[#828c94]">잠금 중 허용 앱 · 합격 점수 (BE lock/policy 연동)</p>

      <div className="ch-card mt-6 space-y-5 p-5">
        <PassScoreControl
          value={passScore}
          onChange={(v) => {
            setPassScore(v);
            void updateLockPolicy({ pass_score: v, allow_phone: allowPhone, allowlist }).catch(
              () => undefined,
            );
          }}
        />
        <label className="flex items-center justify-between text-sm">
          <span>잠금 중 전화·긴급번호 허용</span>
          <input
            type="checkbox"
            checked={allowPhone}
            onChange={(e) => {
              setAllowPhone(e.target.checked);
              void updateLockPolicy({
                pass_score: passScore,
                allow_phone: e.target.checked,
                allowlist,
              }).catch(() => undefined);
            }}
            className="h-5 w-5 accent-[#00b8cf]"
          />
        </label>
      </div>

      <div className="ch-card mt-4 p-5">
        <p className="text-sm font-bold text-[#2f3438]">잠금 중 허용 앱</p>
        <ul className="mt-3 space-y-2">
          {ALLOWLIST_OPTIONS.map((opt) => (
            <li key={opt.id}>
              <label className="flex items-center justify-between rounded-lg bg-[#f7f9fa] px-3 py-2.5 text-sm">
                <span>{opt.label}</span>
                <input
                  type="checkbox"
                  checked={allowlist.includes(opt.id)}
                  onChange={() => toggleAllow(opt.id)}
                  className="h-5 w-5 accent-[#00b8cf]"
                />
              </label>
            </li>
          ))}
        </ul>
        <button type="button" onClick={syncPolicy} className="ch-btn-secondary mt-4 w-full py-2.5 text-sm">
          정책 저장
        </button>
      </div>
    </div>
  );
}
