'use client'
import { useEffect, useState } from 'react'

interface TimerBadgeProps {
  startedAt: number // timestamp ms
  durationMs?: number // default 15분
  onExpire?: () => void
}

export function TimerBadge({ startedAt, durationMs = 15 * 60 * 1000, onExpire }: TimerBadgeProps) {
  const [remaining, setRemaining] = useState(durationMs)

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startedAt
      const left = Math.max(0, durationMs - elapsed)
      setRemaining(left)
      if (left === 0) { clearInterval(interval); onExpire?.() }
    }, 1000)
    return () => clearInterval(interval)
  }, [startedAt, durationMs, onExpire])

  const mins = Math.floor(remaining / 60000)
  const secs = Math.floor((remaining % 60000) / 1000)
  const isUrgent = remaining < 60000

  return (
    <div className={`flex items-center gap-1.5 text-[11px] tracking-widest font-mono ${
      isUrgent ? 'text-[#f87171] animate-pulse' : 'text-[#fbbf24]'
    }`}>
      <span>⏱</span>
      <span>전격토벌</span>
      <span className={`font-bold ${isUrgent ? 'text-[#ef4444]' : ''}`}>
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
      <span className="text-[rgba(251,191,36,0.6)]">— EXP×2</span>
    </div>
  )
}
