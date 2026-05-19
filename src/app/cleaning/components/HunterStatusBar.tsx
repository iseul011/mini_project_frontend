'use client'
import { useCleaningStore } from '../store'

export function HunterStatusBar() {
  const { hunter } = useCleaningStore()
  const progress = Math.round((hunter.exp / hunter.expToNext) * 100)

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-[#07091a] border-b border-[rgba(82,168,255,0.1)]">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] tracking-[2px] text-[rgba(126,200,255,0.6)]">
            Lv.{hunter.level} {hunter.title}
          </span>
          <span className="text-[10px] text-[#fbbf24]">💰 {hunter.gold}G</span>
        </div>
        <div className="h-1 bg-[rgba(56,182,255,0.1)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#1d4ed8] to-[#38bdf8] rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-[9px] text-[rgba(126,200,255,0.3)] tracking-widest mt-0.5">
          {hunter.exp} / {hunter.expToNext} EXP
        </div>
      </div>
      <div className="text-[10px] tracking-widest text-[rgba(251,191,36,0.6)]">
        🔥 {hunter.streak}일
      </div>
    </div>
  )
}
