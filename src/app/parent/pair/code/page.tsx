'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ParentPairCodePage() {
  const router = useRouter();
  const [code, setCode] = useState('');

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-5 py-10">
      <Link href="/parent/pair" className="text-xs font-semibold text-[#00b8cf]">← 뒤로</Link>
      <h1 className="mt-4 text-[26px] font-bold text-[#2f3438]">코드 입력</h1>
      <p className="mt-2 text-sm text-[#828c94]">자녀 앱에 표시된 6자리 코드</p>

      <input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
        placeholder="A3K9P2"
        className="mt-8 rounded-xl border border-[#eaedef] px-4 py-4 text-center text-2xl font-bold tracking-[0.4em] outline-none focus:border-[#00b8cf]"
      />

      <button
        type="button"
        onClick={() => router.push('/parent/pair/success')}
        disabled={code.length < 6}
        className="ch-btn-primary mt-6 py-4 text-[15px] disabled:opacity-50"
      >
        연결하기
      </button>
    </div>
  );
}
