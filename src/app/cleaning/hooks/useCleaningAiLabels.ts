'use client'

import { useEffect, useState } from 'react'
import { fetchCleaningAiInfo } from '@/app/cleaning/api'

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
    fetchCleaningAiInfo()
      .then(data => {
        if (cancelled) return
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
