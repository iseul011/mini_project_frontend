// src/app/cleaning/store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  DailyQuest, HunterStatus, PhotoSession,
  PenaltyZoneId, ChaosSummon, RaidEvent,
} from './types'
import { TODAY_QUEST } from './mock-data/quests'
import { INITIAL_HUNTER, TITLE_THRESHOLDS } from './mock-data/hunter'

interface CleaningStore {
  quest: DailyQuest
  hunter: HunterStatus
  photoSession: PhotoSession | null
  chaosSummon: ChaosSummon
  activeRoomId: string | null
  timeAttackStartedAt: number | null
  raidEvent: RaidEvent | null

  // actions
  acceptQuest: () => void
  startTimeAttack: () => void
  checkItem: (roomId: string, itemId: string) => void
  setBeforePhoto: (
    roomId: string,
    url: string,
    scan?: { monsters: { id: string; name: string; grade: string; location: string; icon: string; ability: string; ability_desc?: string; exp: number; gold: number }[]; pollution_level: number },
  ) => void
  setAfterPhoto: (roomId: string, url: string, cleanliness: number) => void
  completeRoom: (roomId: string) => void
  gainExp: (amount: number, goldAmount: number) => void
  setActiveRoom: (roomId: string | null) => void
  triggerChaosSummon: () => void
  enterPenaltyZone: (zoneId: PenaltyZoneId) => void
  clearPenaltyZone: (zoneId: PenaltyZoneId) => void
  resetQuest: () => void
  // 기습 레이드
  triggerRaid: () => void
  defeatRaid: () => void
  dismissRaid: () => void
}

export const useCleaningStore = create<CleaningStore>()(
  persist(
    (set, get) => ({
      quest: TODAY_QUEST,
      hunter: INITIAL_HUNTER,
      photoSession: null,
      chaosSummon: { active: false },
      activeRoomId: null,
      timeAttackStartedAt: null,
      raidEvent: null,

      acceptQuest: () =>
        set(s => ({ quest: { ...s.quest, status: 'in_progress', timeAttackActive: false } })),

      startTimeAttack: () =>
        set(s => ({
          quest: { ...s.quest, timeAttackActive: true },
          timeAttackStartedAt: Date.now(),
        })),

      checkItem: (roomId, itemId) =>
        set(s => ({
          quest: {
            ...s.quest,
            rooms: s.quest.rooms.map(r =>
              r.id === roomId
                ? { ...r, checklist: r.checklist.map(c => c.id === itemId ? { ...c, done: true } : c) }
                : r
            ),
          },
        })),

      setBeforePhoto: (roomId, url, scan) =>
        set((s) => {
          const monsters = scan?.monsters?.map((m) => ({
            id: m.id,
            name: m.name,
            grade: m.grade as 'E' | 'D' | 'C' | 'B' | 'A' | 'S',
            location: m.location,
            icon: m.icon,
            ability: m.ability,
            abilityDesc: m.ability_desc ?? m.ability,
            requiresPhoto: true,
            exp: m.exp,
            gold: m.gold,
          })) ?? s.quest.rooms.find((r) => r.id === roomId)?.monsters ?? [];
          return {
            photoSession: {
              roomId,
              beforePhotoUrl: url,
              beforePollution: scan?.pollution_level ?? s.quest.rooms.find((r) => r.id === roomId)?.pollutionLevel ?? 70,
              afterCleanliness: 0,
              monstersDetected: monsters,
            },
          };
        }),

      setAfterPhoto: (roomId, url, cleanliness) =>
        set(s => ({
          photoSession: s.photoSession
            ? { ...s.photoSession, afterPhotoUrl: url, afterCleanliness: cleanliness }
            : null,
        })),

      completeRoom: (roomId) =>
        set(s => ({
          quest: {
            ...s.quest,
            rooms: s.quest.rooms.map(r =>
              r.id === roomId ? { ...r, cleared: true, lastCleaned: new Date().toISOString() } : r
            ),
          },
        })),

      gainExp: (amount, goldAmount) =>
        set(s => {
          const newExp = s.hunter.exp + amount
          const newGold = s.hunter.gold + goldAmount
          let { level, expToNext, title, jobClass } = s.hunter
          let remaining = newExp
          while (remaining >= expToNext) {
            remaining -= expToNext
            level += 1
            expToNext = Math.floor(expToNext * 1.3)
          }
          const newStreak = s.hunter.streak + 1
          const lastThreshold = [...TITLE_THRESHOLDS].reverse().find(t => newStreak >= t.streak)
          if (lastThreshold) { title = lastThreshold.title; jobClass = lastThreshold.jobClass }
          const titles = [...new Set([...s.hunter.titles, title])]
          return { hunter: { ...s.hunter, level, exp: remaining, expToNext, gold: newGold, streak: newStreak, title, jobClass, titles } }
        }),

      setActiveRoom: (roomId) => set({ activeRoomId: roomId }),

      triggerChaosSummon: () => {
        const now = new Date()
        const deadline = new Date(now.getTime() + 24 * 60 * 60 * 1000)
        set({ chaosSummon: { active: true, startedAt: now.toISOString(), deadlineAt: deadline.toISOString() } })
      },

      enterPenaltyZone: (_zoneId) =>
        set(s => ({ quest: { ...s.quest, status: 'failed' } })),

      clearPenaltyZone: (zoneId) =>
        set(s => ({
          hunter: { ...s.hunter, penaltyZoneClears: { ...s.hunter.penaltyZoneClears, [zoneId]: true } },
          quest: { ...s.quest, status: 'pending' },
          chaosSummon: zoneId === 'chaos' ? { active: false } : s.chaosSummon,
        })),

      resetQuest: () =>
        set({ quest: { ...TODAY_QUEST, status: 'pending' }, photoSession: null, timeAttackStartedAt: null }),

      triggerRaid: () =>
        set({
          raidEvent: {
            id: `raid-${Date.now()}`,
            active: true,
            triggeredAt: Date.now(),
            deadlineAt: Date.now() + 60_000,
            defeated: false,
          },
        }),

      defeatRaid: () =>
        set(s => ({
          raidEvent: s.raidEvent ? { ...s.raidEvent, active: false, defeated: true } : null,
          hunter: { ...s.hunter, exp: s.hunter.exp + 50, gold: s.hunter.gold + 30 },
        })),

      dismissRaid: () =>
        set({ raidEvent: null }),
    }),
    { name: 'cleaning-store' }
  )
)
