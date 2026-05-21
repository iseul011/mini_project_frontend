'use client';

import { useState } from 'react';
import { getRole, type ChungsoraRole } from '@/lib/chungsora/role';

/** localStorage role — ParentShell 오인 방지를 위해 null → resolved 순서로 반환 */
export function useChungsoraRole() {
  const [role] = useState<ChungsoraRole | null>(() => getRole());

  return role;
}
