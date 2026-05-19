interface ExpResultSheetProps {
  baseExp: number
  timeAttackMultiplier: number
  aiBonus: number
  leveledUp: boolean
  newLevel: number
  newTitle?: string
}

export function ExpResultSheet({ baseExp, timeAttackMultiplier, aiBonus, leveledUp, newLevel, newTitle }: ExpResultSheetProps) {
  const total = (baseExp * timeAttackMultiplier) + aiBonus
  return (
    <div className="px-4 py-3">
      {[
        { label: '기본 EXP', value: `+${baseExp}` },
        { label: `전격토벌 ×${timeAttackMultiplier}`, value: `×${timeAttackMultiplier}` },
        { label: 'AI 청결 보너스', value: `+${aiBonus}` },
      ].map(row => (
        <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-[rgba(82,168,255,0.06)]">
          <span className="text-[11px] text-[#374151] tracking-widest">{row.label}</span>
          <span className="text-[12px] text-[#fbbf24] font-medium">{row.value}</span>
        </div>
      ))}
      <div className="flex items-center justify-between py-2">
        <span className="text-[11px] text-[rgba(126,200,255,0.6)] tracking-[3px]">총 획득</span>
        <span className="text-[#7ec8ff] text-xl font-bold">+{total} EXP</span>
      </div>
      {leveledUp && (
        <div className="mt-2 bg-[rgba(167,139,250,0.12)] border border-[rgba(139,92,246,0.35)] text-[#c084fc] text-[11px] tracking-[3px] py-2 text-center rounded-sm">
          ⭐ LEVEL UP! Lv.{newLevel - 1} → Lv.{newLevel}
          {newTitle && <div className="text-[9px] mt-0.5 text-[rgba(192,132,252,0.7)]">칭호 획득: {newTitle}</div>}
        </div>
      )}
    </div>
  )
}
