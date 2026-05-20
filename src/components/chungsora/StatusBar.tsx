'use client';

export function StatusBar() {
  const now = new Date();
  const time = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className="flex items-center justify-between px-5 py-2 text-[11px] font-semibold text-[#2f3438]">
      <span>{time}</span>
      <div className="flex items-center gap-1.5 text-[10px] text-[#828c94]">
        <span>LTE</span>
        <span>▮▮▮</span>
        <span>🔋</span>
      </div>
    </div>
  );
}
