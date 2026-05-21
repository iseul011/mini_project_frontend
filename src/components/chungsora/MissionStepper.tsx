'use client';

export type MissionStep = 1 | 2 | 3 | 4 | 5;

const STEPS: { n: MissionStep; label: string }[] = [
  { n: 1, label: '잠금' },
  { n: 2, label: '청소 전' },
  { n: 3, label: '청소' },
  { n: 4, label: '청소 후' },
  { n: 5, label: '결과' },
];

export function MissionStepper({ current }: { current: MissionStep }) {
  return (
    <nav
      aria-label="미션 진행"
      className="flex gap-1 border-b border-[#dbdbdb] bg-white px-3 py-2 safe-top"
    >
      {STEPS.map(({ n, label }) => {
        const active = n === current;
        const done = n < current;
        return (
          <div
            key={n}
            className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 ${active ? 'opacity-100' : 'opacity-55'}`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                active
                  ? 'bg-[#00b8cf] text-white'
                  : done
                    ? 'bg-[#1a1e22] text-white'
                    : 'bg-[#f0f2f4] text-[#8e8e8e]'
              }`}
            >
              {done ? '✓' : n}
            </span>
            <span
              className={`truncate text-[9px] ${active ? 'font-bold text-[#1a1e22]' : 'text-[#8e8e8e]'}`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </nav>
  );
}
