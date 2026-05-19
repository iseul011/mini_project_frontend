// src/app/cleaning/types.ts

export type MonsterGrade = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | '??'

export interface Monster {
  id: string
  name: string
  grade: MonsterGrade
  location: string
  icon: string
  ability: string
  abilityDesc: string
  exp: number
  gold: number
  requiresPhoto: boolean
  splitOnNeglect?: { hours: number }
  timeAttackWeakness?: boolean
  raidRequired?: boolean
  isHidden?: boolean
}

export interface ChecklistItem {
  id: string
  monsterId: string
  label: string
  detail: string
  exp: number
  done: boolean
  requiresPhoto: boolean
}

export interface DungeonRoom {
  id: string
  name: string
  icon: string
  grade: MonsterGrade
  monsters: Monster[]
  checklist: ChecklistItem[]
  cleared: boolean
  lastCleaned?: string // ISO date
  pollutionLevel: number // 0–100
  isDanger?: boolean
}

export interface DailyQuest {
  id: string
  date: string
  rooms: DungeonRoom[]
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'failed'
  timeAttackActive: boolean
  timeAttackEndsAt?: string // ISO date
  timeAttackMultiplier: number
  totalExp: number
  totalGold: number
}

export interface HunterStatus {
  level: number
  exp: number
  expToNext: number
  gold: number
  title: string
  jobClass: string
  streak: number
  titles: string[]
  penaltyZoneClears: Partial<Record<PenaltyZoneId, boolean>>
}

export interface PhotoSession {
  roomId: string
  beforePhotoUrl?: string
  afterPhotoUrl?: string
  beforePollution: number
  afterCleanliness: number
  monstersDetected: Monster[]
}

export type PenaltyZoneId = 'desert' | 'trash' | 'toilet' | 'laundry' | 'chaos'

export interface PenaltyZone {
  id: PenaltyZoneId
  name: string
  subtitle: string
  icon: string
  bgFrom: string
  bgTo: string
  borderColor: string
  entryCondition: string
  escapeMission: string
  escapeDetail: string
}

export interface ChaosSummon {
  active: boolean
  startedAt?: string // ISO date
  deadlineAt?: string // ISO date (startedAt + 24h)
}

// Feature 3: 기습 레이드
export interface RaidEvent {
  id: string
  active: boolean
  triggeredAt: number   // Date.now()
  deadlineAt: number    // triggeredAt + 60000 (60초)
  defeated: boolean
}
