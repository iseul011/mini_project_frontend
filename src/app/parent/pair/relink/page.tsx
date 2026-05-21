'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

/** 자녀 휴대폰 교체 시 — 기존 onboard 유지, 새 코드만 발급 */
export default function ParentPairRelinkPage() {
  const router = useRouter();

  const start = () => {
    sessionStorage.setItem('pair_relink_mode', '1');
    router.push('/parent/pair/code');
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-5 py-10">
      <Link href="/parent/more" className="text-[13px] font-semibold text-[#00b8cf]">
        ← 더보기
      </Link>
      <h1 className="mt-4 text-[26px] font-bold text-[#1a1e22]">새 휴대폰 연결</h1>
      <p className="mt-2 text-[14px] leading-relaxed text-[#828c94]">
        자녀가 폰을 바꾼 경우에만 사용하세요. 가족 연결·청소 기록·포인트는 그대로이고, 새 폰에서
        입력할 연결 코드만 다시 발급합니다.
      </p>
      <div className="mt-6 rounded-xl bg-[#e6f9fc] px-4 py-3.5 text-[13px] text-[#007b8a]">
        처음 연결이 아니라면 이 메뉴를 쓰지 않아도 됩니다.
      </div>
      <button
        type="button"
        onClick={start}
        className="ch-btn-primary mt-8 w-full py-4 text-[16px] font-bold"
      >
        새 연결 코드 받기
      </button>
    </div>
  );
}
