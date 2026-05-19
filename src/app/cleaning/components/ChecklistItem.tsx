'use client'
import type { ChecklistItem as ChecklistItemType } from '../types'

interface Props {
  item: ChecklistItemType
  onCheck: () => void
}

export function ChecklistItem({ item, onCheck }: Props) {
  return (
    <div
      onClick={() => !item.done && onCheck()}
      className={`
        flex items-center gap-3 px-4 py-3 mb-2 rounded-lg border cursor-pointer
        active:scale-[0.98] transition-all select-none
        ${item.done
          ? 'opacity-40 bg-[rgba(22,163,74,0.04)] border-[rgba(22,163,74,0.15)]'
          : 'bg-[rgba(56,182,255,0.02)] border-[rgba(82,168,255,0.12)] hover:border-[rgba(82,168,255,0.3)]'
        }
      `}
    >
      <div className={`
        w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 text-sm transition-all
        ${item.done ? 'bg-[rgba(22,163,74,0.3)] border-[#166534] text-[#4ade80]' : 'border-[rgba(82,168,255,0.4)]'}
      `}>
        {item.done && '✓'}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${item.done ? 'line-through text-[#4b5563]' : 'text-[#c8deff]'}`}>
          {item.label}
        </div>
        <div className="text-[10px] text-[#374151] mt-0.5">
          {item.detail}
          {item.requiresPhoto && (
            <span className="ml-2 text-[rgba(167,139,250,0.7)]">✦ AI 인증 필요</span>
          )}
        </div>
      </div>
      <div className="text-[11px] text-[rgba(251,191,36,0.7)] tracking-wide flex-shrink-0">
        +{item.exp} EXP
      </div>
    </div>
  )
}
