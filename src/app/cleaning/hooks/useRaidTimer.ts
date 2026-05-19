'use client'
import { useEffect, useRef } from 'react'
import { useCleaningStore } from '../store'

const MIN_INTERVAL_MS = 90_000   // 1분 30초
const MAX_INTERVAL_MS = 240_000  // 4분

export function useRaidTimer(enabled: boolean) {
  const { raidEvent, triggerRaid } = useCleaningStore()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!enabled || raidEvent?.active) return

    const delay = MIN_INTERVAL_MS + Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS)
    timerRef.current = setTimeout(() => {
      triggerRaid()
    }, delay)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [enabled, raidEvent?.active, triggerRaid])
}
