// src/app/cleaning/mock-data/hunter.ts
import type { HunterStatus } from '../types'

export const INITIAL_HUNTER: HunterStatus = {
  level: 12,
  exp: 3240,
  expToNext: 4000,
  gold: 820,
  title: '청결의 입문자',
  jobClass: '청소 헌터',
  streak: 3,
  titles: ['각성자', '청결의 입문자'],
  penaltyZoneClears: {},
}

export const TITLE_THRESHOLDS = [
  { streak: 1, title: '각성자', jobClass: '청소 입문자' },
  { streak: 3, title: '청결의 입문자', jobClass: '청소 헌터' },
  { streak: 7, title: '청결의 헌터', jobClass: '청소 헌터' },
  { streak: 30, title: '청결의 군주', jobClass: '청소 마스터' },
]
