'use client';

import Link from 'next/link';
import { PairConnectPanel } from '@/components/chungsora/PairConnectPanel';

export default function ParentPairPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-5 py-10">
      <h1 className="text-[26px] font-bold text-[#2f3438]">자녀 추가</h1>
      <p className="mt-2 text-sm text-[#828c94]">QR · 링크 · 6자리 코드 — 아무거나</p>

      <div className="mt-6">
        <PairConnectPanel />
      </div>

      <Link href="/parent/pair/code" className="ch-btn-secondary mt-6 block py-3.5 text-center text-sm">
        코드 직접 입력 (자녀 기기)
      </Link>
      <Link href="/parent/onboard/baseline" className="ch-btn-primary mt-3 block py-4 text-center text-[15px]">
        다음 · baseline 촬영
      </Link>
    </div>
  );
}
