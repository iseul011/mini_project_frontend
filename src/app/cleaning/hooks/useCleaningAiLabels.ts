'use client'

import { useEffect, useState } from 'react'

export interface CleaningAiLabels {
  visionLabel: string
  chatLabel: string
  visionModel: string
  chatModel: string
  loading: boolean
}

const DEFAULT: CleaningAiLabels = {
  visionLabel: '로컬 AI',
  chatLabel: '로컬 AI',
  visionModel: '',
  chatModel: '',
  loading: true,
}

export function useCleaningAiLabels(): CleaningAiLabels {
  const [labels, setLabels] = useState<CleaningAiLabels>(DEFAULT)

  useEffect(() => {
    let cancelled = false
    fetch('/api/v1/cleaning/ai-info', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (cancelled || !data) return
        setLabels({
          visionLabel: data.vision_label ?? '로컬 AI',
          chatLabel: data.chat_label ?? '로컬 AI',
          visionModel: data.vision_model ?? '',
          chatModel: data.chat_model ?? '',
          loading: false,
        })
      })
      .catch(() => {
        if (!cancelled) setLabels({ ...DEFAULT, loading: false })
      })
    return () => { cancelled = true }
  }, [])

  return labels
}
