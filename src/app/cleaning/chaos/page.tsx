'use client'
import { useRouter } from 'next/navigation'
import { useCleaningStore } from '../store'
import { QuestWindow } from '../components/QuestWindow'

export default function ChaosSummonPage() {
  const router = useRouter()
  const { chaosSummon, triggerChaosSummon } = useCleaningStore()

  const handleSummon = () => {
    triggerChaosSummon()
    router.push('/cleaning')
  }

  const deadline = chaosSummon.deadlineAt
    ? new Date(chaosSummon.deadlineAt).toLocaleString('ko-KR')
    : null

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-[#08080f]">
      <QuestWindow label="강화 마수 소환 의식" variant="red">
        <div className="text-center">
          <div className="text-6xl mb-4">😈</div>
          <p className="text-[#fca5a5] text-[15px] leading-relaxed mb-4" style={{ fontFamily: 'serif' }}>
            일부러 방을 어지럽히면<br />
            강화 카오스 군주가 소환됩니다.
          </p>
          <div className="bg-[rgba(220,38,38,0.08)] border border-[rgba(220,38,38,0.2)] px-3 py-2 mb-4 text-[11px] text-[rgba(248,113,113,0.7)] tracking-wide">
            ⚠ EXP × 3 보상 — 단, 24시간 내 처치 필수<br />
            미처치 시 페널티존 #5 확정 입장
          </div>

          {chaosSummon.active ? (
            <div className="space-y-2">
              <div className="text-[#f87171] text-[13px] tracking-[2px] animate-pulse">
                ⚠ 강화 마수 소환 중
              </div>
              {deadline && (
                <div className="text-[11px] text-[rgba(248,113,113,0.6)]">
                  처치 데드라인: {deadline}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleSummon}
              className="w-full py-3 bg-gradient-to-b from-[#3a0d0d] to-[#1f0505] text-[#fca5a5] border border-[rgba(220,38,38,0.4)] text-[12px] tracking-[2px] active:scale-[0.98] transition-all"
              style={{ fontFamily: 'serif' }}
            >
              😈 소환 의식 시작
            </button>
          )}

          <button
            onClick={() => router.back()}
            className="mt-3 w-full py-2 text-[rgba(126,200,255,0.3)] text-[11px] tracking-[2px]"
          >
            취소
          </button>
        </div>
      </QuestWindow>
    </div>
  )
}
