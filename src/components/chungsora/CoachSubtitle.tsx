'use client';

type CoachSubtitleProps = {
  text: string;
  placeholder?: string;
  /** 오류 등 즉시 읽어야 할 안내 */
  priority?: 'polite' | 'assertive';
};

export function CoachSubtitle({ text, placeholder = '코치 안내', priority = 'polite' }: CoachSubtitleProps) {
  const display = text.trim() || placeholder;

  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="absolute bottom-3 left-3 right-3 rounded-xl bg-black/60 px-3 py-2.5 text-xs leading-relaxed text-white shadow-lg ring-1 ring-white/10"
    >
      <span className="sr-only">코치 안내: </span>
      <span className={text.trim() ? 'text-white' : 'text-white/50'}>{display}</span>
    </div>
  );
}
