'use client';

import { useEffect, useState } from 'react';
import { StatusBar } from '@/components/chungsora/StatusBar';
import { ParentShell } from '@/components/parent/ParentShell';
import { ChildShell } from '@/components/child/ChildShell';
import { getRole, type ChungsoraRole } from '@/lib/chungsora/role';

export function RoleShell({
  children,
  childHideNav,
}: {
  children: React.ReactNode;
  childHideNav?: boolean;
}) {
  const [role, setRole] = useState<ChungsoraRole>('parent');

  useEffect(() => {
    setRole(getRole());
  }, []);

  if (role === 'child') {
    if (childHideNav) {
      return (
        <div className="mx-auto min-h-dvh w-full max-w-lg bg-[#f7f9fa]">
          <StatusBar />
          {children}
        </div>
      );
    }
    return <ChildShell>{children}</ChildShell>;
  }
  return <ParentShell>{children}</ParentShell>;
}
