import Link from 'next/link';

const STEPS = [
  { emoji: '📸', title: 'baseline', desc: '깨끗한 방 기준 사진' },
  { emoji: '🔒', title: '잠금', desc: '스케줄 시간에 기기 잠금' },
  { emoji: '📷', title: 'dirty', desc: 'Before 촬영 · AI 코치' },
  { emoji: '🔍', title: 'scan', desc: 'AI가 청소 리스트 생성' },
  { emoji: '✅', title: '청소', desc: '리스트 항목 하나씩 완료' },
  { emoji: '📷', title: 'after', desc: 'After 촬영' },
  { emoji: '🤖', title: 'verify', desc: 'AI 점수 · 합격 판정' },
  { emoji: '🔓', title: '잠금 해제', desc: '포인트 지급 · 스트릭' },
];

export default function ParentFlowPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-5 py-10">
      <h1 className="text-[26px] font-bold text-[#2f3438]">청소 세션 흐름</h1>
      <p className="mt-2 text-sm text-[#828c94]">baseline → dirty → scan → 청소 → after → verify → unlock</p>

      <ol className="mt-8 space-y-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="ch-card flex items-center gap-4 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0f2f4] text-lg">{s.emoji}</span>
            <div>
              <p className="text-sm font-bold text-[#2f3438]">
                {i + 1}. {s.title}
              </p>
              <p className="text-xs text-[#828c94]">{s.desc}</p>
            </div>
          </li>
        ))}
      </ol>

      <Link href="/parent/home" className="ch-btn-primary mt-8 block py-4 text-center text-[15px]">
        홈으로 시작
      </Link>
    </div>
  );
}
