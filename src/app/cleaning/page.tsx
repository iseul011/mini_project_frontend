'use client'
import { useRouter } from 'next/navigation'
import { useCleaningStore } from './store'
import { HunterStatusBar } from './components/HunterStatusBar'
import { DungeonMap } from './components/DungeonMap'
import { ROOMS } from './mock-data/rooms'

export default function CleaningHubPage() {
  const router = useRouter()
  const { quest } = useCleaningStore()

  const allRooms = ROOMS.map(r => {
    const questRoom = quest.rooms.find(q => q.id === r.id)
    return questRoom ?? { ...r, cleared: true }
  })
  const pendingRooms = allRooms.filter(r => !r.cleared)

  return (
    <div className="flex flex-col h-full">
      <HunterStatusBar />

      {/* 섹션 헤더 */}
      <div className="px-4 pt-4 pb-2">
        <div className="text-[10px] tracking-[4px] text-[rgba(126,200,255,0.4)]">[ 집 던전 현황 ]</div>
        <h1 className="text-white font-bold text-lg mt-0.5" style={{ fontFamily: 'serif' }}>
          오늘의 마수 현황
        </h1>
        <p className="text-[12px] text-[#4b5563] mt-0.5">
          {pendingRooms.length}개 구역에 마수가 잠복 중입니다
        </p>
      </div>

      {/* 던전 지도 */}
      <DungeonMap rooms={allRooms} />

      {/* 일일 퀘스트 시작 버튼 */}
      {quest.status === 'pending' && (
        <div className="px-4 mt-2">
          <button
            onClick={() => router.push('/cleaning/quest')}
            className="w-full py-4 bg-gradient-to-b from-[#1a3a6e] to-[#0d2045] text-[#7ec8ff] border border-[rgba(82,168,255,0.5)] text-[13px] tracking-[3px] shadow-[0_0_20px_rgba(56,182,255,0.2)] active:scale-[0.98] transition-all"
            style={{ fontFamily: 'serif' }}
          >
            [ 일일 퀘스트 수락 ]
          </button>
        </div>
      )}

      {/* 어지럽히기 버튼 */}
      <div className="px-4 mt-3 mb-4">
        <button
          onClick={() => router.push('/cleaning/chaos')}
          className="w-full py-2.5 bg-[#1a0000] text-[rgba(248,113,113,0.6)] border border-[rgba(220,38,38,0.2)] text-[11px] tracking-[2px] active:scale-[0.98] transition-all rounded-sm"
          style={{ fontFamily: 'serif' }}
        >
          😈 강화 마수 소환 의식 (어지럽히기)
        </button>
      </div>

      {/* 하단 네비 */}
      <div className="mt-auto border-t border-[rgba(82,168,255,0.1)] flex">
        {[
          { label: '던전', icon: '🗺', href: '/cleaning' },
          { label: '상태창', icon: '⚔', href: '/cleaning/status' },
          { label: '페널티', icon: '💀', href: '/cleaning/penalty/desert' },
        ].map(item => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className="flex-1 flex flex-col items-center py-3 text-[rgba(126,200,255,0.4)] hover:text-[rgba(126,200,255,0.8)] transition-colors"
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-[9px] tracking-[1px] mt-0.5">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
