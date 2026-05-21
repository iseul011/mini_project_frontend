import {
  COACH_CHARACTERS,
  type CoachCharacterId,
} from '@/lib/chungsora/coachCharacters';

type CoachAvatarProps = {
  characterId: CoachCharacterId;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  className?: string;
};

const SIZE_PX = { sm: 24, md: 32, lg: 56 } as const;

export function CoachAvatar({
  characterId,
  size = 'md',
  selected = false,
  className = '',
}: CoachAvatarProps) {
  const c = COACH_CHARACTERS[characterId];
  const px = SIZE_PX[size];
  return (
    <span
      role="img"
      aria-label={`${c.name} 안내 친구`}
      className={`inline-flex shrink-0 items-center justify-center rounded-full text-center ${className}`}
      style={{
        width: px,
        height: px,
        fontSize: size === 'lg' ? 28 : size === 'md' ? 18 : 14,
        backgroundColor: c.bg,
        boxShadow: selected ? `0 0 0 2px ${c.ring}` : undefined,
      }}
    >
      {c.emoji}
    </span>
  );
}
