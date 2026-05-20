import Link from 'next/link';

export default function MoreLegalPage() {
  return (
    <div className="px-5 py-6">
      <Link href="/parent/more" className="text-xs font-semibold text-[#00b8cf]">← 더보기</Link>
      <h1 className="mt-3 text-xl font-bold text-[#2f3438]">이용약관 · 개인정보</h1>
      <div className="ch-card mt-6 p-5 text-sm leading-relaxed text-[#828c94]">
        <p>청소해라 서비스 이용약관 및 개인정보 처리방침 (데모)</p>
      </div>
    </div>
  );
}
