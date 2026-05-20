'use client';

type PassScoreControlProps = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
};

export function PassScoreControl({
  value,
  onChange,
  min = 50,
  max = 95,
  step = 5,
}: PassScoreControlProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, Math.round(n / step) * step));

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-[#2f3438]">합격 점수</span>
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(clamp(Number(e.target.value) || min))}
          className="w-16 rounded-lg border border-[#eaedef] px-2 py-1 text-center text-sm font-bold text-[#00b8cf] outline-none focus:border-[#00b8cf]"
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-[#00b8cf]"
      />
    </div>
  );
}
