'use client'
import { useState, useRef, useEffect } from 'react'
import { coachChat } from '../api'
import type { ChatMessage } from '../api'
import { useCleaningAiLabels } from '../hooks/useCleaningAiLabels'

interface Props {
  roomId: string
  roomName: string
  pollutionLevel: number
  monstersRemaining: string[]
}

export function AiCoachChat({ roomId, roomName, pollutionLevel, monstersRemaining }: Props) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [coachModelLabel, setCoachModelLabel] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const { chatLabel } = useCleaningAiLabels()
  const coachAi = coachModelLabel ?? (chatLabel ? `${chatLabel} AI` : '로컬 AI')

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const userMsg: ChatMessage = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    try {
      const res = await coachChat(roomId, roomName, pollutionLevel, monstersRemaining, [...messages, userMsg], text)
      if (res.model_label) setCoachModelLabel(`${res.model_label} AI`)
      setMessages(prev => [...prev, { role: 'assistant', content: res.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '연결이 끊겼습니다. 잠시 후 다시 시도하세요.' }])
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-40 w-12 h-12 rounded-full bg-[rgba(167,139,250,0.15)] border border-[rgba(139,92,246,0.5)] text-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] flex items-center justify-center active:scale-90 transition-all"
        aria-label="AI 코치 채팅 열기"
      >
        🤖
      </button>
    )
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#07091a] border-t border-[rgba(139,92,246,0.3)] flex flex-col"
      style={{ maxHeight: '50vh' }}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[rgba(139,92,246,0.2)]">
        <span className="text-[11px] tracking-[2px] text-[rgba(167,139,250,0.8)]">🤖 {coachAi} 코치</span>
        <button onClick={() => setOpen(false)} className="text-[rgba(255,255,255,0.4)] text-lg leading-none">✕</button>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-[120px]">
        {messages.length === 0 && (
          <p className="text-[rgba(126,200,255,0.3)] text-[11px] text-center mt-4">
            청소 팁을 물어보세요!
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-3 py-2 rounded-lg text-[12px] leading-relaxed ${
              m.role === 'user'
                ? 'bg-[rgba(56,182,255,0.1)] text-[rgba(126,200,255,0.9)] border border-[rgba(56,182,255,0.2)]'
                : 'bg-[rgba(139,92,246,0.1)] text-[rgba(167,139,250,0.9)] border border-[rgba(139,92,246,0.2)]'
            }`}>
              {m.role === 'assistant'
                ? m.content.split('\n').map((line, idx, arr) =>
                    line.trim() === ''
                      ? <span key={idx} className="block mt-2" />
                      : <span key={idx} className="block">{line}{idx < arr.length - 1 ? '' : ''}</span>
                  )
                : m.content
              }
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-3 py-2 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)] rounded-lg text-[rgba(167,139,250,0.6)] text-[11px] animate-pulse">
              코치가 생각 중...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div className="flex px-3 py-2 gap-2 border-t border-[rgba(139,92,246,0.15)]">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="팁 요청..."
          className="flex-1 bg-[rgba(255,255,255,0.04)] border border-[rgba(139,92,246,0.25)] rounded px-3 py-1.5 text-[12px] text-white placeholder-[rgba(255,255,255,0.2)] outline-none"
        />
        <button
          onClick={send}
          disabled={loading}
          className="px-3 py-1.5 bg-[rgba(139,92,246,0.2)] border border-[rgba(139,92,246,0.4)] text-[rgba(167,139,250,0.9)] text-[11px] tracking-widest rounded active:scale-95 transition-all disabled:opacity-40"
        >
          전송
        </button>
      </div>
    </div>
  )
}
