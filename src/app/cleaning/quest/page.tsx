'use client'
import { useRouter } from 'next/navigation'
import { useCleaningStore } from '../store'
import { QuestWindow } from '../components/QuestWindow'

export default function QuestPopupPage() {
  const router = useRouter()
  const { quest, acceptQuest, startTimeAttack, setActiveRoom } = useCleaningStore()

  const handleAccept = () => {
    acceptQuest()
    startTimeAttack()
    const firstRoom = quest.rooms[0]
    if (firstRoom) setActiveRoom(firstRoom.id)
    router.push('/cleaning/scan')
  }

  const handleReject = () => {
    router.back()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-[#08080f]">
      {/* 배경 파티클 효과 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 rounded-full bg-[rgba(82,168,255,0.6)]"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 20}%`,
              animation: `float-particle ${2 + i * 0.5}s infinite ease-in-out`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      <QuestWindow stepNum={1} label="퀘스트 알림" variant="blue" footer="CLEANING DUNGEON">
        <div className="text-center">
          <p className="text-[#d0e8ff] text-[16px] leading-[1.8] mb-4" style={{ fontFamily: 'serif' }}>
            청소 던전이 열렸습니다.<br />
            오늘의 마수를 처치하시겠습니까?
          </p>

          {/* 퀘스트 목록 */}
          <div className="border border-[rgba(82,168,255,0.15)] bg-[rgba(56,182,255,0.03)] p-3 mb-4 text-left">
            <div className="text-[9px] tracking-[3px] text-[rgba(126,200,255,0.5)] mb-2">
              [ 오늘의 토벌 목록 ]
            </div>
            {quest.rooms.slice(0, 3).map(room => (
              <div key={room.id} className="flex items-center gap-2 py-1.5 border-b border-[rgba(82,168,255,0.08)] last:border-0">
                <span className="text-[rgba(82,168,255,0.7)] text-[10px]">◈</span>
                <span className="text-[#c8deff] text-[12px] flex-1">{room.name} 던전</span>
                <span className="text-[rgba(251,191,36,0.8)] text-[10px]">
                  +{room.monsters.reduce((s, m) => s + m.exp, 0)} EXP
                </span>
              </div>
            ))}
          </div>

          {/* 보상 요약 */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-[rgba(251,191,36,0.7)] tracking-widest mb-5">
            <span>예상 보상</span>
            <span className="text-[rgba(82,168,255,0.3)]">|</span>
            <span>+{quest.totalExp} EXP</span>
            <span className="text-[rgba(82,168,255,0.3)]">·</span>
            <span>+{quest.totalGold}G</span>
          </div>

          {/* 타임어택 안내 */}
          <div className="bg-[rgba(251,191,36,0.05)] border border-[rgba(251,191,36,0.2)] px-3 py-2 mb-5 text-[11px] text-[rgba(251,191,36,0.7)] tracking-wide">
            ⚡ 15분 내 완료 시 — EXP × 2 보너스
          </div>

          {/* 버튼 */}
          <div className="flex gap-2">
            <button
              onClick={handleAccept}
              className="flex-1 py-3 bg-gradient-to-b from-[#1a3a6e] to-[#0d2045] text-[#7ec8ff] border border-[rgba(82,168,255,0.5)] text-[13px] tracking-[3px] shadow-[0_0_10px_rgba(56,182,255,0.2)] hover:shadow-[0_0_20px_rgba(56,182,255,0.4)] active:scale-[0.98] transition-all"
              style={{ fontFamily: 'serif' }}
            >
              수락
            </button>
            <button
              onClick={handleReject}
              className="flex-1 py-3 bg-[#10101e] text-[rgba(126,200,255,0.35)] border border-[rgba(82,168,255,0.1)] text-[13px] tracking-[3px] active:scale-[0.98] transition-all"
              style={{ fontFamily: 'serif' }}
            >
              거부
            </button>
          </div>
        </div>
      </QuestWindow>

      <style>{`
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
          50% { transform: translateY(-20px) scale(1.5); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
