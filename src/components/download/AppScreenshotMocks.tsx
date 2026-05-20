/** 앱 UI 미리보기 — 실기 스크린샷 대체 (Phase 4) */
const MOCKS = [
  {
    title: '잠금 ON',
    bg: '#2f3438',
    emoji: '🔒',
    caption: '17:00 자동 잠금 · 유튜브·게임 차단',
    light: false,
  },
  {
    title: '청소 촬영',
    bg: '#f7f9fa',
    emoji: '📷',
    caption: '입구·바닥·책상 3곳 AI 검증',
    light: true,
  },
  {
    title: '잠금 해제',
    bg: '#f7f9fa',
    emoji: '🔓',
    caption: 'AI 합격 → 포인트 · 폰 unlock',
    light: true,
  },
] as const;

export function AppScreenshotMocks() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {MOCKS.map((m) => (
        <figure key={m.title} className="w-[140px] shrink-0">
          <div
            className="relative mx-auto aspect-[9/19] w-full overflow-hidden rounded-[22px] border-[3px] border-[#2f3438] shadow-md"
            style={{ background: m.bg }}
          >
            <div className="absolute left-1/2 top-2 h-1 w-8 -translate-x-1/2 rounded-full bg-black/20" />
            <div className="flex h-full flex-col items-center justify-center px-3 pt-6 text-center">
              <span className="text-3xl">{m.emoji}</span>
              <p
                className={`mt-2 text-[11px] font-bold ${m.light ? 'text-[#2f3438]' : 'text-white'}`}
              >
                {m.title}
              </p>
            </div>
          </div>
          <figcaption className="mt-2 text-center text-[11px] leading-snug text-[#828c94]">
            {m.caption}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
