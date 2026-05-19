'use client'
import { useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCleaningStore } from '../../store'
import { ChecklistItem } from '../../components/ChecklistItem'
import { TimerBadge } from '../../components/TimerBadge'
import { GradeBadge } from '../../components/GradeBadge'
import { AiCoachChat } from '../../components/AiCoachChat'
import { RaidAlert } from '../../components/RaidAlert'
import { useSoundSystem } from '../../hooks/useSoundSystem'
import { useRaidTimer } from '../../hooks/useRaidTimer'
import { useCleaningAiLabels } from '../../hooks/useCleaningAiLabels'
import { ROOMS } from '../../mock-data/rooms'

export default function DungeonRoomPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const router = useRouter()
  const { quest, checkItem, timeAttackStartedAt, setActiveRoom, enterPenaltyZone, triggerRaid } = useCleaningStore()
  const { play } = useSoundSystem()
  const { visionLabel } = useCleaningAiLabels()
  const visionAi = visionLabel ? `${visionLabel} AI` : '로컬 AI'

  const room = ROOMS.find(r => r.id === roomId)
  const questRoom = quest.rooms.find(r => r.id === roomId)
  const checklist = questRoom?.checklist ?? room?.checklist ?? []
  const doneCount = checklist.filter(c => c.done).length
  const allDone = doneCount === checklist.length && checklist.length > 0
  // 아직 처치 안 된 마수 이름 목록 (AI 코치 컨텍스트용)
  const monstersRemaining = questRoom?.monsters
    .filter((_, i) => !checklist[i]?.done)
    .map(m => m.name) ?? []

  // Feature 3: 기습 레이드 타이머 (퀘스트 진행 중일 때만)
  useRaidTimer(quest.status === 'in_progress')

  const handleRaidPenalty = useCallback(() => {
    play('penalty')
    enterPenaltyZone('desert')
    router.push('/cleaning/penalty/desert')
  }, [play, enterPenaltyZone, router])

  if (!room) return <div className="text-white p-8">방을 찾을 수 없습니다</div>

  const handleCheck = (itemId: string) => {
    checkItem(roomId, itemId)
    play('pop') // Feature 5: 체크리스트 팝 사운드
  }

  const handleTimerExpire = () => {
    play('penalty')
    router.push('/cleaning/penalty/desert')
  }

  const handleVerify = () => {
    setActiveRoom(roomId)
    router.push('/cleaning/verify')
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#07091a]">
      {/* Feature 3: 기습 레이드 오버레이 */}
      <RaidAlert onPenalty={handleRaidPenalty} />

      {/* MVP 시연용 기습 레이드 트리거 버튼 */}
      <button
        onClick={triggerRaid}
        className="fixed top-4 right-4 z-40 px-3 py-1.5 text-[10px] tracking-[2px] text-[rgba(248,113,113,0.8)] border border-[rgba(220,38,38,0.4)] bg-[rgba(80,0,0,0.6)] rounded-sm backdrop-blur-sm hover:bg-[rgba(120,0,0,0.7)] active:scale-95 transition-all"
        title="기습 레이드 즉시 발동 (시연용)"
      >
        ⚠ 기습 발동
      </button>

      {/* 헤더 */}
      <div className="px-4 pt-12 pb-3 border-b border-[rgba(82,168,255,0.1)]">
        <button onClick={() => router.back()} className="text-[rgba(126,200,255,0.4)] text-sm mb-2">← 돌아가기</button>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[9px] tracking-[2px] text-[rgba(126,200,255,0.4)]">[ {room.name} 던전 ]</span>
          <GradeBadge grade={room.grade} />
        </div>
        <h2 className="text-white text-lg font-bold" style={{ fontFamily: 'serif' }}>
          마수 토벌 체크리스트
        </h2>
        {timeAttackStartedAt && (
          <div className="mt-1.5">
            <TimerBadge startedAt={timeAttackStartedAt} onExpire={handleTimerExpire} />
          </div>
        )}
      </div>

      {/* 진행도 바 */}
      <div className="px-4 py-3">
        <div className="flex justify-between text-[10px] text-[rgba(126,200,255,0.4)] tracking-widest mb-1.5">
          <span>처치 현황</span>
          <span>{doneCount} / {checklist.length}</span>
        </div>
        <div className="h-1 bg-[rgba(56,182,255,0.1)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#1d4ed8] to-[#38bdf8] rounded-full transition-all"
            style={{ width: `${checklist.length ? (doneCount / checklist.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* 체크리스트 */}
      <div className="flex-1 px-4 pb-4">
        {checklist.map(item => (
          <ChecklistItem key={item.id} item={item} onCheck={() => handleCheck(item.id)} />
        ))}
      </div>

      {/* 인증샷 / 완료 버튼 */}
      <div className="px-4 pb-24 space-y-2">
        <button
          onClick={handleVerify}
          className="w-full py-3 bg-[rgba(167,139,250,0.08)] text-[rgba(167,139,250,0.8)] border border-[rgba(139,92,246,0.3)] text-[12px] tracking-[2px] active:scale-[0.98] transition-all"
          style={{ fontFamily: 'serif' }}
        >
          ✦ 📷 인증샷으로 처치 확인 ({visionAi} 판정)
        </button>
        {allDone && (
          <button
            onClick={handleVerify}
            className="w-full py-3.5 bg-gradient-to-b from-[rgba(22,163,74,0.3)] to-[rgba(22,163,74,0.1)] text-[#4ade80] border border-[rgba(22,163,74,0.4)] text-[13px] tracking-[3px] shadow-[0_0_15px_rgba(74,222,128,0.2)] active:scale-[0.98] transition-all"
            style={{ fontFamily: 'serif' }}
          >
            토벌 완료 — 인증샷 촬영 ▶
          </button>
        )}
      </div>

      {/* Feature 2: AI 코치 채팅 (floating 버튼) */}
      <AiCoachChat
        roomId={roomId}
        roomName={room.name}
        pollutionLevel={room.pollutionLevel}
        monstersRemaining={monstersRemaining}
      />
    </div>
  )
}
