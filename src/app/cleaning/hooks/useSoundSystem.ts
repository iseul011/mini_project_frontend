'use client'
import { useCallback, useRef } from 'react'

type SoundType = 'pop' | 'chime' | 'levelup' | 'ominous' | 'penalty' | 'raid'

export function useSoundSystem() {
  const ctxRef = useRef<AudioContext | null>(null)

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return ctxRef.current
  }, [])

  const play = useCallback((type: SoundType) => {
    try {
      const ctx = getCtx()
      const now = ctx.currentTime

      if (type === 'chime') {
        const freqs = [523, 659, 784, 1047]
        freqs.forEach((f, i) => {
          const o = ctx.createOscillator()
          const g = ctx.createGain()
          o.connect(g); g.connect(ctx.destination)
          o.type = 'sine'
          o.frequency.value = f
          const t = now + i * 0.15
          g.gain.setValueAtTime(0.2, t)
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
          o.start(t); o.stop(t + 0.5)
        })
        return
      }

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      switch (type) {
        case 'pop':
          osc.type = 'sine'
          osc.frequency.setValueAtTime(800, now)
          osc.frequency.exponentialRampToValueAtTime(400, now + 0.08)
          gain.gain.setValueAtTime(0.3, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
          osc.start(now); osc.stop(now + 0.1)
          break
        case 'levelup':
          osc.type = 'square'
          osc.frequency.setValueAtTime(330, now)
          osc.frequency.setValueAtTime(440, now + 0.1)
          osc.frequency.setValueAtTime(550, now + 0.2)
          osc.frequency.setValueAtTime(660, now + 0.3)
          gain.gain.setValueAtTime(0.15, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6)
          osc.start(now); osc.stop(now + 0.7)
          break
        case 'ominous':
          osc.type = 'sawtooth'
          osc.frequency.setValueAtTime(80, now)
          osc.frequency.setValueAtTime(120, now + 0.3)
          osc.frequency.setValueAtTime(80, now + 0.6)
          gain.gain.setValueAtTime(0.2, now)
          gain.gain.setValueAtTime(0.2, now + 0.8)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0)
          osc.start(now); osc.stop(now + 1.0)
          break
        case 'penalty':
          osc.type = 'sine'
          osc.frequency.setValueAtTime(440, now)
          osc.frequency.exponentialRampToValueAtTime(110, now + 0.8)
          gain.gain.setValueAtTime(0.25, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0)
          osc.start(now); osc.stop(now + 1.0)
          break
        case 'raid':
          osc.type = 'triangle'
          osc.frequency.setValueAtTime(200, now)
          osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3)
          gain.gain.setValueAtTime(0.3, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
          osc.start(now); osc.stop(now + 0.4)
          break
      }
    } catch {
      // AudioContext 미지원 환경 무시
    }
  }, [getCtx])

  return { play }
}
