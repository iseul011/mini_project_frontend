'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useCleaningStore } from '../store'
import { verifyRoom } from '../api'
import { useCleaningAiLabels } from '../hooks/useCleaningAiLabels'
import { useSoundSystem } from '../hooks/useSoundSystem'
import { ROOMS } from '../mock-data/rooms'

export default function VerifyShotPage() {
  const router = useRouter()
  const { activeRoomId, setAfterPhoto, completeRoom, gainExp, quest } = useCleaningStore()
  const { play } = useSoundSystem()
  const [preview, setPreview] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<{ cleanliness: number; comment: string; modelLabel?: string } | null>(null)
  const { visionLabel } = useCleaningAiLabels()
  const visionAi = visionLabel ? `${visionLabel} AI` : '로컬 AI'

  const roomId = activeRoomId ?? ''
  const room = ROOMS.find(r => r.id === roomId)
  const roomName = room?.name ?? '알 수 없는 방'

  const handleCapture = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    setAnalyzing(true)

    let cleanliness = 88
    let comment = 'AI 채점 완료!'
    let modelLabel = visionAi
    try {
      const res = await verifyRoom(file, roomId, roomName)
      cleanliness = res.cleanliness
      comment = res.comment
      modelLabel = res.model_label ? `${res.model_label} AI` : visionAi
    } catch {
      cleanliness = 85
      comment = 'AI 연결 실패 — 기본 점수가 부여되었습니다.'
    }

    setResult({ cleanliness, comment, modelLabel })
    setAnalyzing(false)

    if (activeRoomId) {
      setAfterPhoto(activeRoomId, url, cleanliness)
      completeRoom(activeRoomId)
      const questRoom = quest.rooms.find(r => r.id === activeRoomId)
      if (questRoom) {
        const baseExp = questRoom.checklist.reduce((s, c) => s + c.exp, 0)
        const mult = quest.timeAttackActive ? quest.timeAttackMultiplier : 1
        const bonus = cleanliness >= 90 ? Math.floor(baseExp * 0.2) : 0
        const totalExp = Math.floor(baseExp * mult) + bonus
        const gold = Math.floor(baseExp / 3)
        gainExp(totalExp, gold)
        // Feature 5: 사운드
        play(cleanliness >= 95 ? 'levelup' : 'chime')
      }
    }
  }, [activeRoomId, roomId, roomName, setAfterPhoto, completeRoom, gainExp, quest, play, visionAi])

  return (
    <div className="flex flex-col h-screen bg-black">
      <div className="flex items-center justify-between px-4 pt-12 pb-3 z-10">
        <button onClick={() => router.back()} className="text-[rgba(255,255,255,0.5)] text-xl">✕</button>
        <span className="text-[11px] tracking-[3px] text-[#4ade80]">토벌 인증샷 — {roomName}</span>
        <div className="w-6" />
      </div>

      <div className="flex-1 relative mx-3 rounded-lg overflow-hidden border-2 border-[rgba(74,222,128,0.5)]">
        {preview ? (
          <img src={preview} alt="after" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[#050d05] flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-3">✅</div>
              <div className="text-[rgba(74,222,128,0.5)] text-[12px] tracking-widest">청소 완료 후 촬영하십시오</div>
              <div className="text-[10px] mt-1 text-[rgba(74,222,128,0.2)]">{visionAi}가 청결도를 채점합니다</div>
            </div>
          </div>
        )}

        {/* 코너 마커 */}
        {(['tl', 'tr', 'bl', 'br'] as const).map(pos => (
          <div key={pos} className={`absolute w-4 h-4 border-[rgba(74,222,128,0.8)] border-solid ${
            pos === 'tl' ? 'top-2 left-2 border-t-2 border-l-2' :
            pos === 'tr' ? 'top-2 right-2 border-t-2 border-r-2' :
            pos === 'bl' ? 'bottom-2 left-2 border-b-2 border-l-2' :
            'bottom-2 right-2 border-b-2 border-r-2'
          }`} />
        ))}

        {analyzing && (
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.6)] flex items-center justify-center">
            <div className="text-[rgba(167,139,250,0.9)] text-[12px] tracking-[3px] animate-pulse">
              ✦ {visionAi} 청결도 채점 중...
            </div>
          </div>
        )}

        {result && !analyzing && (
          <div className="absolute bottom-4 left-4 right-4 bg-[rgba(7,9,26,0.95)] border border-[rgba(74,222,128,0.4)] rounded-lg p-4">
            <div className="text-[9px] tracking-[3px] text-[rgba(167,139,250,0.7)] mb-1">✦ {result.modelLabel ?? visionAi} 판정 결과</div>
            <div className="text-[#4ade80] text-2xl font-bold mb-1">청결도 {result.cleanliness}%</div>
            <div className="text-[rgba(74,222,128,0.6)] text-[11px] mb-3">{result.comment}</div>
            <button
              onClick={() => router.push('/cleaning/result')}
              className="w-full py-2 bg-[rgba(22,163,74,0.2)] border border-[rgba(22,163,74,0.4)] text-[#4ade80] text-[11px] tracking-[2px]"
            >
              결과 확인 ▶
            </button>
          </div>
        )}
      </div>

      {!result && (
        <div className="pb-10 pt-4 flex flex-col items-center gap-3">
          <p className="text-[11px] text-[rgba(74,222,128,0.4)] tracking-widest">청소 후의 모습을 촬영하십시오</p>
          <label className="w-14 h-14 rounded-full bg-[rgba(74,222,128,0.1)] border-2 border-[rgba(74,222,128,0.5)] flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(74,222,128,0.3)] cursor-pointer active:scale-90 transition-transform">
            ✅
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCapture} />
          </label>
        </div>
      )}
    </div>
  )
}
