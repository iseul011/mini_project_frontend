// src/app/cleaning/mock-data/quests.ts
import type { DailyQuest } from '../types'
import { ROOMS } from './rooms'

const activeRooms = ROOMS.filter(r => !r.cleared)

export const TODAY_QUEST: DailyQuest = {
  id: `quest-${new Date().toISOString().split('T')[0]}`,
  date: new Date().toISOString().split('T')[0],
  rooms: activeRooms,
  status: 'pending',
  timeAttackActive: false,
  timeAttackMultiplier: 2,
  totalExp: activeRooms.reduce((sum, r) => sum + r.checklist.reduce((s, c) => s + c.exp, 0), 0),
  totalGold: activeRooms.reduce((sum, r) => sum + r.monsters.reduce((s, m) => s + m.gold, 0), 0),
}
