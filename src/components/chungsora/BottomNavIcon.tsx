'use client';

import type { LucideIcon } from 'lucide-react';

type BottomNavIconProps = {
  icon: LucideIcon;
  active: boolean;
  size?: number;
  filledWhenActive?: boolean;
};

/** 인스타그램형 단색 라인 아이콘 — 비활성 회색, 활성 진한색(선택 시 fill) */
export function BottomNavIcon({
  icon: Icon,
  active,
  size = 24,
  filledWhenActive = false,
}: BottomNavIconProps) {
  return (
    <Icon
      size={size}
      strokeWidth={active ? 2.25 : 1.75}
      fill={filledWhenActive && active ? 'currentColor' : 'none'}
      className={active ? 'text-[#1a1e22]' : 'text-[#8e8e8e]'}
      aria-hidden
    />
  );
}
