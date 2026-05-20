'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/chungsora/authStore';

function authStoreHasHydrated() {
  return useAuthStore.persist?.hasHydrated?.() ?? false;
}

export function useAuthHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (authStoreHasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = useAuthStore.persist?.onFinishHydration?.(() => setHydrated(true));
    return () => unsub?.();
  }, []);

  return hydrated;
}
