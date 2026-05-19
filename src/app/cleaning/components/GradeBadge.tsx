import type { MonsterGrade } from '../types'

const GRADE_STYLES: Record<MonsterGrade, string> = {
  'E': 'bg-[#1f2937] text-[#9ca3af] border-[#374151]',
  'D': 'bg-[#1a2e1a] text-[#4ade80] border-[#166534]',
  'C': 'bg-[#1a1f3a] text-[#60a5fa] border-[#1d4ed8]',
  'B': 'bg-[#2a1a3a] text-[#c084fc] border-[#7c3aed]',
  'A': 'bg-[#2e1a0a] text-[#fb923c] border-[#c2410c]',
  'S': 'bg-[#2e0a0a] text-[#f87171] border-[#b91c1c]',
  '??': 'bg-[#1a0000] text-[#fca5a5] border-[#7f1d1d] animate-pulse',
}

export function GradeBadge({ grade }: { grade: MonsterGrade }) {
  return (
    <span className={`text-[10px] font-bold tracking-widest px-2 py-0.5 border rounded-full ${GRADE_STYLES[grade]}`}>
      {grade}
    </span>
  )
}
