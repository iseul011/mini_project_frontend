'use client'
import { useParams, useRouter } from 'next/navigation'
import { useCleaningStore } from '../../store'
import { QuestWindow } from '../../components/QuestWindow'
import { PENALTY_ZONES } from '../../mock-data/penalty-zones'
import type { PenaltyZoneId } from '../../types'

export default function PenaltyZonePage() {
  const { zoneId } = useParams<{ zoneId: string }>()
  const router = useRouter()
  const { clearPenaltyZone, hunter } = useCleaningStore()

  const zone = PENALTY_ZONES.find(z => z.id === zoneId)
  if (!zone) return <div className="text-white p-8">페널티존을 찾을 수 없습니다</div>

  const isCleared = hunter.penaltyZoneClears[zoneId as PenaltyZoneId]

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: `linear-gradient(180deg, ${zone.bgFrom} 0%, ${zone.bgTo} 100%)` }}
    >
      {/* 헤더 */}
      <div className="px-4 pt-12 pb-4 text-center">
        <div
          className="text-[9px] tracking-[4px] mb-2"
          style={{ color: zone.borderColor }}
        >
          {zone.subtitle}
        </div>
        <div className="text-6xl mb-3">{zone.icon}</div>
        <h1
          className="text-2xl font-bold"
          style={{ color: '#fca5a5', fontFamily: 'serif', textShadow: `0 0 20px ${zone.borderColor}` }}
        >
          {zone.name}
        </h1>
        <p className="text-[12px] text-[#6b7280] mt-2">
          진입 조건: {zone.entryCondition}
        </p>
      </div>

      {/* 탈출 퀘스트 창 */}
      <div className="px-4 py-2">
        <QuestWindow label="탈출 미션" variant="red">
          <div className="text-center">
            <p className="text-[#d0e8ff] text-[15px] leading-relaxed mb-3" style={{ fontFamily: 'serif' }}>
              {zone.escapeMission}
            </p>
            <p className="text-[11px] text-[#4b5563] leading-relaxed mb-5">
              {zone.escapeDetail}
            </p>

            {isCleared ? (
              <div className="text-[#4ade80] text-[13px] tracking-[3px] py-2 border border-[rgba(22,163,74,0.4)] bg-[rgba(22,163,74,0.1)]">
                ✓ 클리어 완료
              </div>
            ) : (
              <button
                onClick={() => {
                  clearPenaltyZone(zoneId as PenaltyZoneId)
                  router.push('/cleaning')
                }}
                className="w-full py-3 bg-gradient-to-b from-[#3a0d0d] to-[#1f0505] text-[#fca5a5] border border-[rgba(220,38,38,0.4)] text-[12px] tracking-[2px] active:scale-[0.98] transition-all"
                style={{ fontFamily: 'serif' }}
              >
                탈출 미션 완료 (인증)
              </button>
            )}
          </div>
        </QuestWindow>
      </div>

      {/* 모든 페널티존 목록 */}
      <div className="px-4 mt-4">
        <div className="text-[9px] tracking-[3px] text-[rgba(248,113,113,0.4)] mb-2">[ 페널티존 목록 ]</div>
        <div className="space-y-1.5">
          {PENALTY_ZONES.map(pz => (
            <button
              key={pz.id}
              onClick={() => router.push(`/cleaning/penalty/${pz.id}`)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded border text-left active:scale-[0.98] transition-all ${
                pz.id === zoneId ? 'border-[rgba(220,38,38,0.5)] bg-[rgba(220,38,38,0.08)]' : 'border-[rgba(220,38,38,0.1)] bg-transparent'
              }`}
            >
              <span className="text-xl">{pz.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-[#fca5a5] truncate">{pz.name}</div>
                <div className="text-[9px] text-[#4b5563]">{pz.subtitle}</div>
              </div>
              {hunter.penaltyZoneClears[pz.id as PenaltyZoneId] && (
                <span className="text-[#4ade80] text-[10px]">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
