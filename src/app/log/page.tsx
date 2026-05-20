'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { RoleShell } from '@/components/chungsora/RoleShell';
import { CleaningLogView } from '@/components/chungsora/CleaningLogView';
import { getRole, type ChungsoraRole } from '@/lib/chungsora/role';

function LogPageInner() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date');
  const [role, setRole] = useState<ChungsoraRole>('parent');

  useEffect(() => setRole(getRole()), []);

  return (
    <RoleShell childHideNav={role === 'child'}>
      <CleaningLogView role={role} showBack={role === 'child'} dateParam={dateParam} />
    </RoleShell>
  );
}

export default function LogPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50dvh] items-center justify-center text-sm text-[#828c94]">
          로그 불러오는 중…
        </div>
      }
    >
      <LogPageInner />
    </Suspense>
  );
}
