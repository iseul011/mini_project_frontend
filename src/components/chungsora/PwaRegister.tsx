'use client';

import { useEffect } from 'react';

export function PwaRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    void navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => reg.update())
      .catch(() => undefined);
  }, []);
  return null;
}
