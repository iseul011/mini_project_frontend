import type { Monster } from '../types'
import { GradeBadge } from './GradeBadge'

interface MonsterCardProps {
  monster: Monster
  defeated?: boolean
}

export function MonsterCard({ monster, defeated = false }: MonsterCardProps) {
  return (
    <div className={`
      bg-[#0e0e1a] border rounded-xl overflow-hidden transition-all
      ${defeated ? 'opacity-40 grayscale border-[rgba(22,163,74,0.2)]' : 'border-[#1e1e3a] hover:border-[#7c3aed]'}
    `}>
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1e1e3a]">
        <span className="text-3xl">{monster.icon}</span>
        <div className="flex-1 min-w-0">
          <div className={`font-bold text-sm ${defeated ? 'line-through text-[#4b5563]' : 'text-[#e0e0ff]'}`}>
            {monster.name}
          </div>
          <div className="text-[11px] text-[#4b5563] mt-0.5">{monster.location}</div>
        </div>
        <GradeBadge grade={monster.grade} />
      </div>
      <div className="px-4 py-3">
        <div className="text-[10px] tracking-[2px] text-[#4b5563] mb-1">[ 고유 능력 ]</div>
        <div className="text-[#fbbf24] text-[13px] font-semibold mb-1">{monster.ability}</div>
        <div className="text-[#6b7280] text-[12px] leading-relaxed">{monster.abilityDesc}</div>
      </div>
      <div className="px-4 pb-3 flex gap-2 flex-wrap">
        {monster.requiresPhoto && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(220,38,38,0.1)] border border-[#991b1b] text-[#f87171]">
            📷 포토 인증 필수
          </span>
        )}
        {monster.timeAttackWeakness && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(74,222,128,0.1)] border border-[#166534] text-[#4ade80]">
            ⚡ 타임어택 즉사
          </span>
        )}
        {monster.raidRequired && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(124,58,237,0.1)] border border-[#4c1d95] text-[#a78bfa]">
            👥 파티 레이드
          </span>
        )}
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(251,191,36,0.1)] border border-[#854d0e] text-[#fbbf24] ml-auto">
          +{monster.exp} EXP
        </span>
      </div>
    </div>
  )
}
