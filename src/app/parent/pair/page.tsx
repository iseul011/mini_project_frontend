'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

// 만 10세(초4)~만 19세 — 잠금 동기부여 이해 가능 + 미성년자 범위
const AGE_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 10);

export default function ParentPairPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!nickname.trim()) { setError('자녀 닉네임을 입력해 주세요.'); return; }
    if (!age) { setError('만 나이를 선택해 주세요.'); return; }
    setError('');
    sessionStorage.setItem('pair_child_nickname', nickname.trim());
    sessionStorage.setItem('pair_child_age', age);
    router.push('/parent/pair/code');
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-[#f7f9fa]">
      <header className="px-5 pb-3 pt-10">
        <p className="text-[13px] font-semibold text-[#00b8cf]">자녀 연결 · 1단계</p>
        <h1 className="mt-1 text-[26px] font-bold leading-tight tracking-[-0.5px] text-[#1a1e22]">
          자녀 정보 입력
        </h1>
        <p className="mt-1.5 text-[14px] text-[#828c94]">
          연결할 자녀의 정보를 입력하면 연결 코드가 발급돼요.
        </p>
      </header>

      <div className="mt-6 flex flex-1 flex-col gap-5 px-5 pb-10">
        <div className="ch-card p-5">
          <label className="block text-[13px] font-semibold text-[#828c94]" htmlFor="nickname">
            자녀 닉네임
          </label>
          <input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(e) => { setNickname(e.target.value); setError(''); }}
            placeholder="예: 지민"
            maxLength={10}
            className="mt-2 w-full rounded-xl border border-[#eaedef] bg-[#f7f9fa] px-4 py-3 text-[16px] font-semibold text-[#1a1e22] outline-none placeholder:text-[#c4c9cf] focus:border-[#00b8cf] focus:bg-white transition-colors"
          />
          <p className="mt-1.5 text-[12px] text-[#adb5bd]">앱에서 자녀를 부르는 이름이에요.</p>
        </div>

        <div className="ch-card p-5">
          <p className="text-[13px] font-semibold text-[#828c94]">만 나이</p>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {AGE_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => { setAge(String(n)); setError(''); }}
                className={[
                  'rounded-xl py-2.5 text-[14px] font-semibold transition-colors',
                  age === String(n)
                    ? 'bg-[#00b8cf] text-white'
                    : 'bg-[#f0f2f4] text-[#2f3438] hover:bg-[#e5e8eb]',
                ].join(' ')}
              >
                {n}세
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="rounded-xl bg-[#fff0f0] px-4 py-3 text-[13px] font-medium text-[#e03131]">
            {error}
          </p>
        )}

        <div className="rounded-xl bg-[#e6f9fc] px-4 py-3.5">
          <p className="text-[13px] font-medium text-[#007b8a]">
            자녀는 별도 회원가입 없이, 다음 단계에서 발급된 코드를 자녀 앱에 입력하면 자동 연결돼요.
          </p>
        </div>

        <div className="mt-auto pt-4">
          <button
            type="button"
            onClick={handleNext}
            disabled={!nickname.trim() || !age}
            className="ch-btn-primary flex w-full items-center justify-center gap-2 py-4 text-[16px] font-bold disabled:opacity-40"
          >
            연결 코드 받기
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
