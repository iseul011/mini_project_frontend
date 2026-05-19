// src/app/cleaning/mock-data/rooms.ts
import type { DungeonRoom } from '../types'
import { MONSTERS } from './monsters'

export const ROOMS: DungeonRoom[] = [
  {
    id: 'bathroom',
    name: '화장실',
    icon: '🚿',
    grade: 'B',
    monsters: [MONSTERS[2], MONSTERS[0]], // toilet-guardian, slime-mold
    checklist: [
      { id: 'bath-1', monsterId: 'slime-mold', label: '세면대 물때 제거', detail: '세면대·수도꼭지', exp: 40, done: false, requiresPhoto: false },
      { id: 'bath-2', monsterId: 'toilet-guardian', label: '변기 오염 가디언 처치', detail: '포토 인증 필수', exp: 120, done: false, requiresPhoto: true },
      { id: 'bath-3', monsterId: 'slime-mold', label: '욕실 바닥 물기 제거', detail: '욕실 전체', exp: 30, done: false, requiresPhoto: false },
    ],
    cleared: false,
    pollutionLevel: 72,
  },
  {
    id: 'kitchen',
    name: '주방',
    icon: '🍳',
    grade: 'A',
    monsters: [MONSTERS[3], MONSTERS[4], MONSTERS[5]], // dish-golem, trash-overlord, fridge-relic
    checklist: [
      { id: 'kit-1', monsterId: 'dish-golem', label: '설거지 골렘 처치', detail: '싱크대 전체', exp: 200, done: false, requiresPhoto: false },
      { id: 'kit-2', monsterId: 'trash-overlord', label: '쓰레기 마왕 처치', detail: '분리수거 포함', exp: 100, done: false, requiresPhoto: false },
      { id: 'kit-3', monsterId: 'fridge-relic', label: '냉장고 유물 봉인 해제', detail: '유통기한 확인', exp: 80, done: false, requiresPhoto: false },
    ],
    cleared: false,
    pollutionLevel: 85,
    isDanger: true,
  },
  {
    id: 'living-room',
    name: '거실',
    icon: '🛋',
    grade: 'C',
    monsters: [MONSTERS[1]], // dust-ghost (hidden)
    checklist: [
      { id: 'liv-1', monsterId: 'dust-ghost', label: '바닥 청소기 돌리기', detail: '거실 전체', exp: 50, done: false, requiresPhoto: false },
      { id: 'liv-2', monsterId: 'dust-ghost', label: '소파 먼지 털기', detail: '쿠션 포함', exp: 30, done: false, requiresPhoto: false },
    ],
    cleared: false,
    pollutionLevel: 55,
  },
  {
    id: 'bedroom',
    name: '침실',
    icon: '🛏',
    grade: 'E',
    monsters: [MONSTERS[1], MONSTERS[6]], // dust-ghost, laundry-lord
    checklist: [
      { id: 'bed-1', monsterId: 'dust-ghost', label: '침구 정리', detail: '이불·베개', exp: 20, done: false, requiresPhoto: false },
      { id: 'bed-2', monsterId: 'laundry-lord', label: '옷 정리', detail: '바닥 빨래 포함', exp: 40, done: false, requiresPhoto: false },
    ],
    cleared: true,
    lastCleaned: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    pollutionLevel: 15,
  },
  {
    id: 'balcony',
    name: '베란다',
    icon: '🪟',
    grade: 'E',
    monsters: [MONSTERS[0]],
    checklist: [
      { id: 'bal-1', monsterId: 'slime-mold', label: '베란다 바닥 쓸기', detail: '먼지 제거', exp: 25, done: false, requiresPhoto: false },
    ],
    cleared: true,
    lastCleaned: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    pollutionLevel: 20,
  },
]
