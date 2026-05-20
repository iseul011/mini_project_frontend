'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AuthState = {
  parentLoggedIn: boolean;
  childPaired: boolean;
  onboardDone: boolean;
  parentLoginId: string;
  parentDisplayName: string;
  parentToken: string;
  childToken: string;
  setParentSession: (payload: {
    loginId: string;
    displayName?: string;
    token: string;
    onboardDone?: boolean;
  }) => void;
  setChildSession: (payload: { token: string }) => void;
  setChildPaired: (v: boolean) => void;
  setOnboardDone: (v: boolean) => void;
  logout: () => void;
  logoutChild: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      parentLoggedIn: false,
      childPaired: false,
      onboardDone: false,
      parentLoginId: '',
      parentDisplayName: '',
      parentToken: '',
      childToken: '',
      setParentSession: ({ loginId, displayName, token, onboardDone }) =>
        set((s) => ({
          parentLoggedIn: true,
          parentLoginId: loginId,
          parentDisplayName: displayName ?? loginId,
          parentToken: token,
          onboardDone: onboardDone ?? s.onboardDone,
        })),
      setChildSession: ({ token }) =>
        set({ childPaired: true, childToken: token }),
      setChildPaired: (v) => set({ childPaired: v }),
      setOnboardDone: (v) => set({ onboardDone: v }),
      logout: () =>
        set({
          parentLoggedIn: false,
          parentLoginId: '',
          parentDisplayName: '',
          parentToken: '',
          onboardDone: false,
        }),
      logoutChild: () =>
        set({
          childPaired: false,
          childToken: '',
        }),
    }),
    { name: 'chungsora-auth-v2' },
  ),
);

async function logoutParentSession() {
  await fetch('/api/v1/auth/logout', { method: 'POST' });
}

async function logoutChildSession() {
  await fetch('/api/v1/auth/logout/child', { method: 'POST' });
}

export function logoutParent() {
  useAuthStore.getState().logout();
  void logoutParentSession();
}

export function logoutChild() {
  useAuthStore.getState().logoutChild();
  void logoutChildSession();
}
