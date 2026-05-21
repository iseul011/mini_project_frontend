export const PRAISE_EMOJI = ['👏', '🔥', '💯', '⭐', '❤️', '🎉'] as const;

/** v2 로그 — 카카오톡 채팅방 톤 */
export const LOG_CHAT_BG = '#BACEE0';

export function formatLogDateLabel(date: Date) {
  return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
}

export function parseLogDateParam(param?: string | null): Date {
  if (param && /^\d{4}-\d{2}-\d{2}$/.test(param)) {
    const d = new Date(`${param}T12:00:00`);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}

export function toLogDateParam(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
