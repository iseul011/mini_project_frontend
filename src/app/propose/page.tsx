'use client';

import { RoleShell } from '@/components/chungsora/RoleShell';
import { ProposeReviewPanel } from '@/components/parent/ProposeReviewPanel';
import { ChildProposeSendPanel } from '@/components/child/ChildProposeSendPanel';
import { getRole } from '@/lib/chungsora/role';
import { useEffect, useState } from 'react';

export default function ProposePage() {
  const [role, setRole] = useState<'parent' | 'child'>('parent');
  useEffect(() => setRole(getRole()), []);

  return (
    <RoleShell>
      {role === 'parent' ? <ProposeReviewPanel /> : <ChildProposeSendPanel />}
    </RoleShell>
  );
}
