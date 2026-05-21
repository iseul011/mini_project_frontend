'use client';

import { useSyncExternalStore } from 'react';
import { useAuthStore } from '@/lib/chungsora/authStore';

function authStoreHasHydrated() {
  return useAuthStore.persist?.hasHydrated?.() ?? false;
}

export function useAuthHydrated() {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (authStoreHasHydrated()) return () => undefined;
      const unsub = useAuthStore.persist?.onFinishHydration?.(onStoreChange);
      return () => unsub?.();
    },
    authStoreHasHydrated,
    () => false,
  );
}
