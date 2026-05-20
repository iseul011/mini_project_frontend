'use client'
import { useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useCleaningStore } from '../store'
import { scanRoom } from '../api'
import { useCleaningAiLabels } from '../hooks/useCleaningAiLabels'
import { ROOMS } from '../mock-data/rooms'

type Mode = 'camera' | 'upload'

export default function DungeonScanPage() {
  const router = useRouter()
  const { setBeforePhoto, activeRoomId } = useCleaningStore()
  const cameraRef = useRef<HTMLInputElement>(null)
  const uploadRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [scanMsg, setScanMsg] = useState('')
  const [mode, setMode] = useState<Mode>('camera')
  const { visionLabel } = useCleaningAiLabels()
  const visionAi = visionLabel ? `${visionLabel} AI` : '로컬 AI'

  const roomId = activeRoomId ?? 'bathroom'
  const room = ROOMS.find(r => r.id === roomId)
  const roomName = room?.name ?? '알 수 없는 방'

  const handleFile = useCallback(async (file: File) => {
    const url = URL.createObjectURL(file)
    setPreview(url)
    setScanning(true)
    setScanMsg(`${visionAi}가 마수를 탐지 중...`)
    try {
      const result = await scanRoom(file, roomId, roomName)
      const used = result.model_label ? `${result.model_label} AI` : visionAi
      setScanMsg(`${used}가 마수를 탐지 중...`)
      setBeforePhoto(roomId, url, {
        monsters: result.monsters,
        pollution_level: result.pollution_level,
      })
      setScanMsg(`마수 ${result.monsters.length}마리 탐지 완료!`)
      setTimeout(() => {
        setScanning(false)
        router.push('/cleaning/scan/result')
      }, 800)
    } catch {
      setScanMsg('AI 연결 실패 — 기본 마수 소환 중...')
      setBeforePhoto(roomId, url)
      setTimeout(() => {
        setScanning(false)
        router.push('/cleaning/scan/result')
      }, 1000)
    }
  }, [roomId, roomName, setBeforePhoto, router, visionAi])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 pt-12 pb-3 z-10">
        <button onClick={() => router.back()} className="text-[rgba(255,255,255,0.5)] text-xl">✕</button>
        <span className="text-[11px] tracking-[3px] text-[rgba(126,200,255,0.8)]">던전 스캔 — {roomName}</span>
        <div className="w-6" />
      </div>

      {/* 모드 탭 (Feature 4: 업로드 모드) */}
      <div className="flex mx-3 mb-2 border border-[rgba(82,168,255,0.2)] rounded overflow-hidden">
        {(['camera', 'upload'] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-1.5 text-[11px] tracking-[2px] transition-colors ${
              mode === m
                ? 'bg-[rgba(56,182,255,0.15)] text-[rgba(126,200,255,0.9)]'
                : 'text-[rgba(126,200,255,0.3)]'
            }`}
          >
            {m === 'camera' ? '📷 카메라' : '🖼 업로드'}
          </button>
        ))}
      </div>

      {/* 뷰파인더 */}
      <div className="flex-1 relative mx-3 rounded-lg overflow-hidden border border-[rgba(82,168,255,0.4)]">
        {preview ? (
          <img src={preview} alt="scan" className="w-full h-full object-cover brightness-75" />
        ) : (
          <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center">
            <div className="text-[rgba(82,168,255,0.3)] text-[13px] tracking-widest text-center">
              <div className="text-4xl mb-3">{mode === 'camera' ? '📷' : '🖼'}</div>
              <div>{mode === 'camera' ? '카메라로 방을 스캔하십시오' : '사진을 업로드하십시오'}</div>
              <div className="text-[10px] mt-1 text-[rgba(82,168,255,0.2)]">{visionAi}가 마수를 탐지합니다</div>
            </div>
          </div>
        )}

        {/* AI 분석 오버레이 */}
        {scanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.6)]">
            <div className="text-center">
              <div className="text-[rgba(167,139,250,0.9)] text-[12px] tracking-[3px] animate-pulse">
                ✦ {scanMsg}
              </div>
            </div>
          </div>
        )}

        {/* 코너 마커 */}
        {(['tl', 'tr', 'bl', 'br'] as const).map(pos => (
          <div key={pos} className={`absolute w-4 h-4 border-[rgba(82,168,255,0.8)] border-solid ${
            pos === 'tl' ? 'top-2 left-2 border-t-2 border-l-2' :
            pos === 'tr' ? 'top-2 right-2 border-t-2 border-r-2' :
            pos === 'bl' ? 'bottom-2 left-2 border-b-2 border-l-2' :
            'bottom-2 right-2 border-b-2 border-r-2'
          }`} />
        ))}
        <div className="absolute bottom-2 left-0 right-0 text-center text-[9px] tracking-[2px] text-[rgba(56,182,255,0.6)]">
          {visionLabel} 마수 탐지 스캐너
        </div>
      </div>

      {/* 셔터 영역 */}
      <div className="pb-10 pt-4 flex flex-col items-center gap-3">
        <p className="text-[11px] text-[rgba(126,200,255,0.4)] tracking-widest">
          {mode === 'camera' ? `방을 촬영하면 ${visionAi}가 마수를 탐지합니다` : '갤러리에서 방 사진을 선택하세요'}
        </p>

        {mode === 'camera' ? (
          <label className="w-14 h-14 rounded-full bg-[rgba(56,182,255,0.1)] border-2 border-[rgba(56,182,255,0.5)] flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(56,182,255,0.3)] cursor-pointer active:scale-90 transition-transform">
            📷
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleChange}
            />
          </label>
        ) : (
          <label className="px-6 py-3 bg-[rgba(56,182,255,0.1)] border border-[rgba(56,182,255,0.4)] text-[rgba(126,200,255,0.8)] text-[12px] tracking-[2px] rounded cursor-pointer active:scale-95 transition-all">
            🖼 사진 선택
            <input
              ref={uploadRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleChange}
            />
          </label>
        )}
      </div>
    </div>
  )
}
