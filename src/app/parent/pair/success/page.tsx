import Link from 'next/link';

export default function ParentPairSuccessPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-5 py-10 text-center">
      <p className="text-5xl">✅</p>
      <h1 className="mt-4 text-[26px] font-bold text-[#2f3438]">연결 완료!</h1>
      <p className="mt-2 text-sm text-[#828c94]">지민과 연결됐어요</p>
      <Link href="/parent/onboard/baseline" className="ch-btn-primary mt-8 block w-full py-4 text-[15px]">
        온보딩 계속하기
      </Link>
    </div>
  );
}
