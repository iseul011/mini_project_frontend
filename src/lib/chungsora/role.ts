'use client';

export type ChungsoraRole = 'parent' | 'child';

const KEY = 'chungsora-role';

export function getRole(): ChungsoraRole {
  if (typeof window === 'undefined') return 'parent';
  const v = localStorage.getItem(KEY);
  return v === 'child' ? 'child' : 'parent';
}

export function setRole(role: ChungsoraRole) {
  localStorage.setItem(KEY, role);
}
