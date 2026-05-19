'use client'
import { useEffect, useState } from 'react'
import { useCleaningStore } from '../store'
import { useSoundSystem } from '../hooks/useSoundSystem'

export function RaidAlert({ onPenalty }: { onPenalty: () => void }) {
  const { raidEvent, defeatRaid, dismissRaid } = useCleaningStore()
  const { play } = useSoundSystem()
  const [timeLeft, setTimeLeft] = useState(60)

  useEffect(() => {
    if (!raidEvent?.active) return
    play('ominous')
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((raidEvent.deadlineAt - Date.now()) / 1000))
      setTimeLeft(remaining)
      if (remaining <= 0) {
        clearInterval(interval)
        dismissRaid()
        onPenalty()
      }
    }, 500)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raidEvent?.active, raidEvent?.deadlineAt])

  if (!raidEvent?.active) return null

  const handleDefeat = () => {
    play('raid')
    defeatRaid()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(80,0,0,0.85)] backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm border border-[rgba(220,38,38,0.6)] bg-[#0d0000] p-6 rounded-sm shadow-[0_0_40px_rgba(220,38,38,0.4)]">
        {/* 경보 헤더 */}
        <div className="text-[10px] tracking-[4px] text-[rgba(248,113,113,0.6)] mb-2 animate-pulse">
          ⚠ 기습 레이드 발생 ⚠
        </div>
        <h2 className="text-[rgba(248,113,113,0.9)] text-xl font-bold mb-1" style={{ fontFamily: 'serif' }}>
          강화 마수가 침입했다!
        </h2>
        <p className="text-[rgba(248,113,113,0.5)] text-[12px] mb-5">
          {timeLeft}초 안에 처치하지 않으면 페널티존으로 추방된다
        </p>

        {/* 타이머 바 */}
        <div className="h-2 bg-[rgba(220,38,38,0.15)] rounded-full overflow-hidden mb-5">
          <div
            className="h-full bg-gradient-to-r from-red-700 to-red-500 rounded-full transition-all"
            style={{ width: `${(timeLeft / 60) * 100}%` }}
          />
        </div>

        <button
          onClick={handleDefeat}
          className="w-full py-4 bg-gradient-to-b from-[rgba(220,38,38,0.3)] to-[rgba(185,28,28,0.2)] text-[rgba(248,113,113,0.9)] border border-[rgba(220,38,38,0.5)] text-[13px] tracking-[3px] active:scale-[0.98] transition-all"
          style={{ fontFamily: 'serif' }}
        >
          ⚔ 기습 마수 처치! (+50 EXP / +30 Gold)
        </button>
      </div>
    </div>
  )
}
