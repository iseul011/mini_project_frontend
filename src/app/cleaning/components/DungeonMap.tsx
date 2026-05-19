'use client'
import { useRouter } from 'next/navigation'
import type { DungeonRoom } from '../types'
import { GradeBadge } from './GradeBadge'

const GRADE_BORDER: Record<string, string> = {
  'E': 'border-[#374151]',
  'D': 'border-[#166534]',
  'C': 'border-[#1d4ed8]',
  'B': 'border-[#7c3aed]',
  'A': 'border-[#c2410c]',
  'S': 'border-[#b91c1c]',
  '??': 'border-[#7f1d1d]',
}

export function DungeonMap({ rooms }: { rooms: DungeonRoom[] }) {
  const router = useRouter()

  return (
    <div className="grid grid-cols-3 gap-2 p-4">
      {rooms.map(room => (
        <button
          key={room.id}
          onClick={() => router.push(`/cleaning/dungeon/${room.id}`)}
          className={`
            relative flex flex-col items-center justify-center
            bg-[#0d1f35] rounded-xl py-3 px-2
            border-2 transition-all active:scale-95
            ${room.cleared
              ? 'border-[#166534] bg-[#0a1f0f]'
              : room.isDanger
              ? `${GRADE_BORDER[room.grade]} animate-pulse bg-[#1f0a0a]`
              : GRADE_BORDER[room.grade]
            }
          `}
        >
          {room.cleared && (
            <span className="absolute top-1 right-2 text-[#4ade80] text-[9px]">✓</span>
          )}
          <span className="text-2xl mb-1">{room.icon}</span>
          <span className="text-[10px] text-[#94a3b8]">{room.name}</span>
          <div className="mt-1">
            <GradeBadge grade={room.cleared ? 'E' : room.grade} />
          </div>
          {!room.cleared && (
            <div className="mt-1.5 w-full h-1 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[rgba(220,38,38,0.6)] rounded-full"
                style={{ width: `${room.pollutionLevel}%` }}
              />
            </div>
          )}
        </button>
      ))}
    </div>
  )
}
