'use client';

import { useEffect } from 'react';
import { registerPwaAutoUpdate } from '@/lib/chungsora/pwaUpdate';

/** PWA: 배포 후 앱을 열면 SW·JS가 자동 갱신되고 필요 시 1회 새로고침 */
export function PwaRegister() {
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    void registerPwaAutoUpdate().then((fn) => {
      cleanup = fn;
    });
    return () => cleanup?.();
  }, []);
  return null;
}
