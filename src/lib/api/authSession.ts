'use client';

import { useAuthStore } from '@/lib/chungsora/authStore';

export function getAuthToken(): string {
  if (typeof window === 'undefined') return '';
  const s = useAuthStore.getState();
  return s.parentToken || s.childToken;
}

export function authHeaders(extra?: HeadersInit): HeadersInit {
  const token = getAuthToken();
  const base: Record<string, string> = {};
  if (token) base.Authorization = `Bearer ${token}`;
  return { ...base, ...(extra as Record<string, string> | undefined) };
}

/** @deprecated use getAuthToken */
export function getParentToken(): string {
  return useAuthStore.getState().parentToken;
}
