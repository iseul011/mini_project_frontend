'use client'
import { useRouter } from 'next/navigation'
import { useCleaningStore } from '../store'
import { QuestWindow } from '../components/QuestWindow'

export default function HunterStatusPage() {
  const router = useRouter()
  const { hunter } = useCleaningStore()
  const progress = Math.round((hunter.exp / hunter.expToNext) * 100)

  return (
    <div className="flex flex-col min-h-screen bg-[#07091a] pb-8">
      <div className="px-4 pt-12 pb-4 border-b border-[rgba(82,168,255,0.1)]">
        <button onClick={() => router.back()} className="text-[rgba(126,200,255,0.4)] text-sm mb-3">← 돌아가기</button>
        <div className="text-[10px] tracking-[3px] text-[rgba(126,200,255,0.4)]">[ 헌터 상태창 ]</div>
        <h1 className="text-white text-xl font-bold mt-0.5" style={{ fontFamily: 'serif' }}>
          {hunter.jobClass}
        </h1>
      </div>

      <div className="px-4 py-5">
        <QuestWindow label="HUNTER STATUS" variant="blue">
          {/* 레벨 + EXP */}
          <div className="text-center mb-4">
            <div className="text-[rgba(126,200,255,0.5)] text-[10px] tracking-[3px]">LEVEL</div>
            <div className="text-[#7ec8ff] text-4xl font-bold my-1">{hunter.level}</div>
            <div className="text-[rgba(251,191,36,0.7)] text-[12px] tracking-[2px]">{hunter.title}</div>
          </div>

          {/* EXP 바 */}
          <div className="mb-4">
            <div className="flex justify-between text-[9px] text-[rgba(126,200,255,0.4)] tracking-widest mb-1">
              <span>EXP</span>
              <span>{hunter.exp} / {hunter.expToNext}</span>
            </div>
            <div className="h-2 bg-[rgba(56,182,255,0.1)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#1d4ed8] to-[#38bdf8] rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* 스탯 */}
          {[
            { label: '보유 골드', value: `${hunter.gold} G`, icon: '💰' },
            { label: '연속 클리어', value: `${hunter.streak}일`, icon: '🔥' },
            { label: '현재 직업', value: hunter.jobClass, icon: '⚔' },
          ].map(stat => (
            <div key={stat.label} className="flex items-center gap-3 py-2 border-b border-[rgba(82,168,255,0.08)] last:border-0">
              <span className="text-lg">{stat.icon}</span>
              <span className="text-[11px] text-[#4b5563] flex-1 tracking-widest">{stat.label}</span>
              <span className="text-[12px] text-[#c8deff]">{stat.value}</span>
            </div>
          ))}
        </QuestWindow>

        {/* 획득 칭호 목록 */}
        <div className="mt-4">
          <div className="text-[9px] tracking-[3px] text-[rgba(126,200,255,0.4)] mb-2">[ 획득 칭호 ]</div>
          <div className="space-y-1.5">
            {hunter.titles.map(t => (
              <div key={t} className={`px-3 py-2 border text-[12px] tracking-widest ${
                t === hunter.title
                  ? 'border-[rgba(251,191,36,0.4)] bg-[rgba(251,191,36,0.06)] text-[#fbbf24]'
                  : 'border-[rgba(82,168,255,0.1)] text-[#4b5563]'
              }`} style={{ fontFamily: 'serif' }}>
                {t === hunter.title && '▶ '}{t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
