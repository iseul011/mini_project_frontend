'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useCleaningStore } from '../store'
import { PhotoComparison } from '../components/PhotoComparison'
import { QuestWindow } from '../components/QuestWindow'
import { saveCleaningMemory } from '../api'

export default function BattleResultPage() {
  const router = useRouter()
  const { photoSession, hunter, quest } = useCleaningStore()
  const savedRef = useRef(false)

  // Feature 10: 청소 완료 후 second-brain에 기억 자동 저장
  useEffect(() => {
    if (savedRef.current || !photoSession) return
    savedRef.current = true
    const room = quest.rooms.find(r => r.id === photoSession.roomId)
    const expGained = room?.checklist.reduce((s, c) => s + c.exp, 0) ?? 0
    saveCleaningMemory({
      room_id: photoSession.roomId,
      room_name: room?.name ?? '알 수 없는 방',
      cleanliness: photoSession.afterCleanliness,
      monsters_cleared: room?.monsters.map(m => m.name) ?? [],
      duration_seconds: 0,
      exp_gained: expGained,
      gold_gained: Math.floor(expGained / 3),
    }).catch(() => undefined)
  }, [photoSession, quest.rooms])

  const baseExp = photoSession
    ? (quest.rooms.find(r => r.id === photoSession.roomId)?.checklist.reduce((s, c) => s + c.exp, 0) ?? 0)
    : 0
  const mult = quest.timeAttackActive ? quest.timeAttackMultiplier : 1
  const aiBonus = photoSession ? Math.floor(baseExp * (photoSession.afterCleanliness - 88) / 100) : 0
  const total = (baseExp * mult) + aiBonus

  return (
    <div className="flex flex-col min-h-screen bg-[#07091a] pb-8">
      {/* 완료 헤더 */}
      <div className="px-4 pt-12 pb-4 text-center border-b border-[rgba(82,168,255,0.1)]">
        <div className="text-[10px] tracking-[3px] text-[rgba(126,200,255,0.4)] mb-1">[ 토벌 완료 ]</div>
        <h1 className="text-[#4ade80] text-xl font-bold" style={{ fontFamily: 'serif' }}>
          마수를 처치했습니다!
        </h1>
      </div>

      {/* 전후 비교 */}
      {photoSession && (
        <PhotoComparison
          beforeUrl={photoSession.beforePhotoUrl}
          afterUrl={photoSession.afterPhotoUrl}
          beforePollution={photoSession.beforePollution}
          afterCleanliness={photoSession.afterCleanliness}
        />
      )}

      {/* AI 청결도 바 */}
      {photoSession && (
        <div className="px-4 py-3 border-b border-[rgba(82,168,255,0.08)]">
          <div className="flex justify-between text-[10px] tracking-widest mb-1.5">
            <span className="text-[rgba(167,139,250,0.6)]">✦ AI 청결도 분석</span>
            <span className="text-[#4ade80]">{photoSession.afterCleanliness}%</span>
          </div>
          <div className="h-1.5 bg-[rgba(167,139,250,0.1)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#7c3aed] to-[#4ade80] rounded-full"
              style={{ width: `${photoSession.afterCleanliness}%` }}
            />
          </div>
        </div>
      )}

      {/* EXP 결산 */}
      <QuestWindow label="보상 결산" variant="gold">
        <div className="space-y-1.5">
          {[
            { label: '기본 EXP', value: `+${baseExp}` },
            { label: `전격토벌 보너스`, value: `×${mult}` },
            { label: 'AI 청결 보너스', value: `+${aiBonus}` },
          ].map(row => (
            <div key={row.label} className="flex justify-between py-1 border-b border-[rgba(251,191,36,0.08)]">
              <span className="text-[11px] text-[#4b5563] tracking-widest">{row.label}</span>
              <span className="text-[12px] text-[#fbbf24] font-medium">{row.value}</span>
            </div>
          ))}
          <div className="flex justify-between pt-1">
            <span className="text-[11px] text-[rgba(126,200,255,0.6)] tracking-[3px]">총 획득</span>
            <span className="text-[#7ec8ff] text-lg font-bold">+{total} EXP</span>
          </div>
        </div>
      </QuestWindow>

      {/* 레벨 표시 */}
      <div className="px-4 mt-2">
        <div className="bg-[rgba(167,139,250,0.12)] border border-[rgba(139,92,246,0.35)] text-[#c084fc] text-[11px] tracking-[3px] py-2 text-center">
          ⭐ Lv.{hunter.level} — {hunter.title}
        </div>
      </div>

      {/* 계속하기 */}
      <div className="px-4 mt-4 space-y-2">
        <button
          onClick={() => router.push('/cleaning')}
          className="w-full py-3.5 bg-gradient-to-b from-[#1a3a6e] to-[#0d2045] text-[#7ec8ff] border border-[rgba(82,168,255,0.5)] text-[13px] tracking-[3px] active:scale-[0.98] transition-all"
          style={{ fontFamily: 'serif' }}
        >
          던전으로 돌아가기
        </button>
        <p className="text-center text-[9px] text-[rgba(82,168,255,0.2)] tracking-widest">화면 캡처로 기록을 남기세요</p>
      </div>
    </div>
  )
}
