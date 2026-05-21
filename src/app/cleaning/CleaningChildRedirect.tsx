'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getRole } from '@/lib/chungsora/role';

/** 자녀 role이 레거시 /cleaning 노드에 들어오면 미션 플로우로 보냄 */
export function CleaningChildRedirect({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (getRole() === 'child') {
      router.replace('/child/lock');
    }
  }, [router]);

  if (typeof window !== 'undefined' && getRole() === 'child') {
    return null;
  }

  return <>{children}</>;
}
