'use client'
import { useRouter } from 'next/navigation'
import { useCleaningStore } from '../../store'
import { MonsterMarker } from '../../components/MonsterMarker'

const MARKER_POSITIONS = [
  { top: '18%', left: '15%' },
  { top: '40%', left: 'auto', right: '20%' },
  { top: 'auto', bottom: '25%', left: '28%' },
]

export default function MonsterRevealPage() {
  const router = useRouter()
  const { photoSession, activeRoomId } = useCleaningStore()

  const monsters = photoSession?.monstersDetected ?? []
  const beforeUrl = photoSession?.beforePhotoUrl

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Before 사진 위에 마수 출현 */}
      <div className="flex-1 relative overflow-hidden">
        {beforeUrl ? (
          <img src={beforeUrl} alt="before" className="w-full h-full object-cover brightness-50 saturate-50" />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-[#2a1e0e] to-[#0a0a0a]" />
        )}

        {/* 붉은 비네트 */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(150,0,0,0.5)_100%)]" />

        {/* 마수 마커들 */}
        {monsters.slice(0, 3).map((monster, i) => (
          <MonsterMarker
            key={monster.id}
            monster={monster}
            position={MARKER_POSITIONS[i] ?? { top: `${20 + i * 20}%`, left: '20%' }}
          />
        ))}

        {/* 마수 탐지 배너 */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-[rgba(180,0,0,0.95)] to-[rgba(100,0,0,0.95)] py-2 px-4 text-center text-[#fca5a5] text-[11px] tracking-[3px] border-t border-[rgba(220,38,38,0.5)]"
          style={{ fontFamily: 'serif' }}
        >
          ⚠ 마수 {monsters.length}체 탐지 완료
        </div>
      </div>

      {/* 마수 목록 + 시작 버튼 */}
      <div className="bg-[#07091a] border-t border-[rgba(82,168,255,0.1)] px-4 py-4">
        <div className="text-[9px] tracking-[3px] text-[rgba(126,200,255,0.4)] mb-2">[ 탐지된 마수 ]</div>
        <div className="space-y-1.5 mb-4">
          {monsters.slice(0, 3).map(m => (
            <div key={m.id} className="flex items-center gap-3 py-1 border-b border-[rgba(82,168,255,0.07)] last:border-0">
              <span className="text-base">{m.icon}</span>
              <span className="text-[12px] text-[#c8deff] flex-1">{m.name}</span>
              <span className="text-[10px] text-[#7ec8ff] tracking-widest">{m.grade}-rank</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => router.push(`/cleaning/dungeon/${activeRoomId ?? 'bathroom'}`)}
          className="w-full py-3.5 bg-gradient-to-b from-[#1a3a6e] to-[#0d2045] text-[#7ec8ff] border border-[rgba(82,168,255,0.5)] text-[13px] tracking-[3px] shadow-[0_0_15px_rgba(56,182,255,0.2)] active:scale-[0.98] transition-all"
          style={{ fontFamily: 'serif' }}
        >
          토벌 시작 ▶
        </button>
      </div>
    </div>
  )
}
