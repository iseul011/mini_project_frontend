interface PhotoComparisonProps {
  beforeUrl?: string
  afterUrl?: string
  beforePollution: number
  afterCleanliness: number
}

export function PhotoComparison({ beforeUrl, afterUrl, beforePollution, afterCleanliness }: PhotoComparisonProps) {
  return (
    <div className="relative flex h-40 overflow-hidden">
      {/* Before */}
      <div className="flex-1 relative overflow-hidden">
        {beforeUrl
          ? <img src={beforeUrl} alt="before" className="w-full h-full object-cover brightness-50 saturate-50" />
          : <div className="w-full h-full bg-gradient-to-br from-[#2a1e0e] to-[#1a1208] flex items-center justify-center text-3xl">🦠</div>
        }
        <div className="absolute top-2 left-0 right-0 text-center text-[9px] tracking-[2px] font-bold text-[rgba(248,113,113,0.9)]">BEFORE</div>
        <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-[rgba(248,113,113,0.8)]">오염도 {beforePollution}%</div>
      </div>

      {/* 중앙 구분선 */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[rgba(82,168,255,0.4)] z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#07091a] border border-[rgba(82,168,255,0.3)] rounded-full w-6 h-6 flex items-center justify-center text-[8px] text-[rgba(126,200,255,0.5)]">
          VS
        </div>
      </div>

      {/* After */}
      <div className="flex-1 relative overflow-hidden">
        {afterUrl
          ? <img src={afterUrl} alt="after" className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-gradient-to-br from-[#0a1a08] to-[#061206] flex items-center justify-center text-3xl">✨</div>
        }
        <div className="absolute top-2 left-0 right-0 text-center text-[9px] tracking-[2px] font-bold text-[rgba(74,222,128,0.9)]">AFTER</div>
        <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-[rgba(74,222,128,0.9)]">청결도 {afterCleanliness}%</div>
      </div>
    </div>
  )
}
