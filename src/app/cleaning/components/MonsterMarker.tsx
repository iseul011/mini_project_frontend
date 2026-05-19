'use client'
import { useState } from 'react'
import type { Monster } from '../types'

interface MonsterMarkerProps {
  monster: Monster
  position: { top?: string; left?: string; right?: string; bottom?: string }
  onTap?: () => void
}

export function MonsterMarker({ monster, position, onTap }: MonsterMarkerProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="absolute flex flex-col items-center gap-1 cursor-pointer z-10"
      style={position}
      onClick={() => { setExpanded(e => !e); onTap?.() }}
    >
      {/* 링 애니메이션 */}
      <div className="relative">
        <div className="absolute -inset-3 rounded-full border border-[rgba(220,38,38,0.5)] animate-ping opacity-75" />
        <div className="absolute -inset-2 rounded-full border border-[rgba(220,38,38,0.3)] animate-pulse" />
        <span className="relative text-2xl drop-shadow-[0_0_8px_rgba(220,38,38,0.9)] z-10">
          {monster.icon}
        </span>
      </div>
      <div className="bg-[rgba(180,20,20,0.9)] text-[#fca5a5] text-[9px] tracking-widest px-1.5 py-0.5 rounded-sm whitespace-nowrap">
        {monster.grade}-RANK
      </div>
      {expanded && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-[#0d0820] border border-[rgba(82,168,255,0.4)] rounded-lg p-2 w-32 z-20 shadow-xl">
          <div className="text-[#c8deff] text-[10px] font-bold mb-0.5">{monster.name}</div>
          <div className="text-[9px] text-[#6b7280]">{monster.ability}</div>
          <div className="text-[rgba(251,191,36,0.8)] text-[9px] mt-1">+{monster.exp} EXP</div>
        </div>
      )}
    </div>
  )
}
