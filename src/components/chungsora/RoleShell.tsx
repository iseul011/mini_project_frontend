'use client';

import { AuthLoading } from '@/components/chungsora/AuthLoading';
import { ParentShell } from '@/components/parent/ParentShell';
import { ChildShell } from '@/components/child/ChildShell';
import { useChungsoraRole } from '@/lib/chungsora/useChungsoraRole';

export function RoleShell({
  children,
  childHideNav,
}: {
  children: React.ReactNode;
  childHideNav?: boolean;
}) {
  const role = useChungsoraRole();

  if (role === null) {
    return <AuthLoading />;
  }

  if (role === 'child') {
    if (childHideNav) {
      return (
        <div className="mx-auto min-h-dvh w-full max-w-lg bg-[#f7f9fa]">
          {children}
        </div>
      );
    }
    return <ChildShell>{children}</ChildShell>;
  }
  return <ParentShell>{children}</ParentShell>;
}
