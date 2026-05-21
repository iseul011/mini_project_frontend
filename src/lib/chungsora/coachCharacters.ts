export const COACH_CHARACTER_IDS = ['jiu', 'seoyeon', 'hajun'] as const;
export type CoachCharacterId = (typeof COACH_CHARACTER_IDS)[number];

export type CoachCharacterMeta = {
  id: CoachCharacterId;
  name: string;
  toneLabel: string;
  emoji: string;
  bg: string;
  ring: string;
  ttsRate: number;
  goodFor: string;
  introSample: string;
  changeAnnounce: string;
};

export const COACH_CHARACTERS: Record<CoachCharacterId, CoachCharacterMeta> = {
  jiu: {
    id: 'jiu',
    name: '지우',
    toneLabel: '반말 · 같이 하는 친구',
    emoji: '🧑‍🎓',
    bg: '#E8F8FB',
    ring: '#00B8CF',
    ttsRate: 1.05,
    goodFor: '촬영에 익숙하고 가볍게 안내받고 싶을 때',
    introSample: '좋아, 오늘 방 미션 시작! 입구부터 가자.',
    changeAnnounce: '오늘부터 지우가 안내할게!',
  },
  seoyeon: {
    id: 'seoyeon',
    name: '서연',
    toneLabel: '존댓말 · 차분한 선배',
    emoji: '👩‍🏫',
    bg: '#F0F2F4',
    ring: '#828C94',
    ttsRate: 0.92,
    goodFor: '왜 이렇게 찍는지 설명이 필요할 때',
    introSample: '오늘 청소를 시작합니다. 먼저 입구 사진을 찍어 주세요.',
    changeAnnounce: '오늘부터 서연이 안내할게요.',
  },
  hajun: {
    id: 'hajun',
    name: '하준',
    toneLabel: '응원 · 진행 알려주기',
    emoji: '🎉',
    bg: '#FFF4E6',
    ring: '#FF9F0A',
    ttsRate: 1.0,
    goodFor: '칭찬과 단계별 응원이 동기가 될 때',
    introSample: '오늘 미션 시작! 1번째, 입구부터 해보자!',
    changeAnnounce: '오늘부터 하준이 안내할게!',
  },
};

export function normalizeCoachCharacterId(id: string | null | undefined): CoachCharacterId {
  if (id && id in COACH_CHARACTERS) return id as CoachCharacterId;
  return 'jiu';
}

export function resolveEffectiveCoachId(
  familyDefault: string | null | undefined,
  childOverride: string | null | undefined,
  apiEffective?: string | null,
): CoachCharacterId {
  if (apiEffective) return normalizeCoachCharacterId(apiEffective);
  if (childOverride) return normalizeCoachCharacterId(childOverride);
  return normalizeCoachCharacterId(familyDefault);
}
