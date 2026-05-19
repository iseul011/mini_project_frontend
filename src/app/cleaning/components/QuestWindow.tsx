'use client'
import type { ReactNode } from 'react'

interface QuestWindowProps {
  stepNum?: number
  label: string
  children: ReactNode
  variant?: 'blue' | 'red' | 'gold'
  footer?: string
}

const VARIANT_STYLES = {
  blue: {
    border: 'border-[rgba(82,168,255,0.5)]',
    glow: 'shadow-[0_0_15px_rgba(56,182,255,0.25),0_0_40px_rgba(56,182,255,0.1),inset_0_0_30px_rgba(56,182,255,0.05)]',
    headerBorder: 'border-[rgba(82,168,255,0.2)]',
    numBorder: 'border-[rgba(82,168,255,0.6)]',
    numColor: 'text-[#7ec8ff]',
    labelColor: 'text-[rgba(126,200,255,0.7)]',
    lineFade: 'from-transparent via-[rgba(82,168,255,0.4)] to-transparent',
    corner: 'rgba(82,168,255,0.8)',
  },
  red: {
    border: 'border-[rgba(220,38,38,0.5)]',
    glow: 'shadow-[0_0_15px_rgba(220,38,38,0.3),0_0_50px_rgba(220,38,38,0.1),inset_0_0_25px_rgba(220,38,38,0.05)]',
    headerBorder: 'border-[rgba(220,38,38,0.25)]',
    numBorder: 'border-[rgba(220,38,38,0.6)]',
    numColor: 'text-[#f87171]',
    labelColor: 'text-[rgba(248,113,113,0.7)]',
    lineFade: 'from-transparent via-[rgba(220,38,38,0.4)] to-transparent',
    corner: 'rgba(220,38,38,0.8)',
  },
  gold: {
    border: 'border-[rgba(251,191,36,0.5)]',
    glow: 'shadow-[0_0_15px_rgba(251,191,36,0.25),inset_0_0_20px_rgba(251,191,36,0.05)]',
    headerBorder: 'border-[rgba(251,191,36,0.2)]',
    numBorder: 'border-[rgba(251,191,36,0.6)]',
    numColor: 'text-[#fbbf24]',
    labelColor: 'text-[rgba(251,191,36,0.7)]',
    lineFade: 'from-transparent via-[rgba(251,191,36,0.4)] to-transparent',
    corner: 'rgba(251,191,36,0.8)',
  },
}

export function QuestWindow({ stepNum, label, children, variant = 'blue', footer }: QuestWindowProps) {
  const s = VARIANT_STYLES[variant]
  return (
    <div className="relative">
      {/* 배경 글로우 */}
      <div className="absolute -inset-5 bg-[radial-gradient(ellipse,rgba(56,182,255,0.08)_0%,transparent_70%)] pointer-events-none" />

      {/* 장식 모서리 */}
      {(['tl', 'tr', 'bl', 'br'] as const).map(pos => (
        <svg
          key={pos}
          className={`absolute w-5 h-5 z-10 ${
            pos === 'tl' ? 'top-[-2px] left-[-2px]' :
            pos === 'tr' ? 'top-[-2px] right-[-2px] scale-x-[-1]' :
            pos === 'bl' ? 'bottom-[-2px] left-[-2px] scale-y-[-1]' :
            'bottom-[-2px] right-[-2px] scale-[-1]'
          }`}
          viewBox="0 0 22 22" fill="none"
        >
          <path d="M1 11V3C1 1.895 1.895 1 3 1H11" stroke={s.corner} strokeWidth="1"/>
          <path d="M1 6V2H5" stroke={s.corner} strokeWidth="0.5" opacity="0.5"/>
          <circle cx="1" cy="1" r="2" fill={s.corner} opacity="0.6"/>
          <circle cx="1" cy="1" r="1" fill="rgba(200,230,255,0.9)"/>
        </svg>
      ))}

      {/* 메인 창 */}
      <div className={`relative z-[1] bg-gradient-to-b from-[#080d1e] to-[#04070f] border ${s.border} ${s.glow}`}>
        {/* 헤더 */}
        <div className={`flex items-center justify-center gap-2 px-5 py-2 border-b ${s.headerBorder}`}>
          <div className={`h-px flex-1 bg-gradient-to-r ${s.lineFade}`} />
          {stepNum !== undefined && (
            <div className={`w-[18px] h-[18px] border rounded-full flex items-center justify-center text-[9px] font-bold ${s.numBorder} ${s.numColor} shadow-[0_0_6px_rgba(56,182,255,0.4)]`}>
              {stepNum}
            </div>
          )}
          <span className={`text-[11px] tracking-[3px] font-light ${s.labelColor}`}>
            {label}
          </span>
          <div className={`h-px flex-1 bg-gradient-to-l ${s.lineFade}`} />
        </div>

        {/* 본문 */}
        <div className="p-4">{children}</div>

        {/* 푸터 */}
        {footer && (
          <div className={`flex items-center justify-between px-5 py-1.5 border-t ${s.headerBorder}`}>
            <span className="text-[9px] tracking-[2px] text-[rgba(82,168,255,0.3)]">SYSTEM</span>
            <div className="w-1 h-1 rounded-full bg-[rgba(82,168,255,0.3)] shadow-[0_0_4px_rgba(56,182,255,0.5)]" />
            <span className="text-[9px] tracking-[2px] text-[rgba(82,168,255,0.3)]">{footer}</span>
          </div>
        )}
      </div>
    </div>
  )
}
