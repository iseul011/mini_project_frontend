/** 청소해라 — 오늘의집·토스 톤 + 포인트 #00B8CF */
export const POINT = '#00B8CF' as const;

export const colors = {
  point: POINT,
  pointSoft: 'rgba(0, 184, 207, 0.12)',
  bg: '#F7F9FA',
  white: '#FFFFFF',
  border: '#EAEDEF',
  borderLight: '#F0F2F4',
  text: '#2F3438',
  textSecondary: '#828C94',
  textMuted: '#ADB5BD',
  danger: '#F04452',
  success: '#00C73C',
  warning: '#FF9F0A',
} as const;

export const WON_PER_P = 10;
export const MONTHLY_CASH_CAP = 50_000;
export const PROPOSAL_EVERY_P = 1_000;

export function wonToP(won: number) {
  return won / WON_PER_P;
}

export function calcCleaningPayout(baseWon: number, score: number, streakDays = 0) {
  const wonFromScore = Math.floor(baseWon * (score / 100));
  const mult =
    streakDays >= 14 ? 2 : streakDays >= 7 ? 1.5 : streakDays >= 3 ? 1.25 : 1;
  const finalWon = Math.round(wonFromScore * mult);
  return { wonFromScore, mult, finalWon, finalP: finalWon / WON_PER_P, scorePct: score };
}
