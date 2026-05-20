'use client';

import { RoleShell } from '@/components/chungsora/RoleShell';
import { ProposeReviewPanel } from '@/components/parent/ProposeReviewPanel';
import { ChildProposeSendPanel } from '@/components/child/ChildProposeSendPanel';
import { useChungsoraRole } from '@/lib/chungsora/useChungsoraRole';

function ProposeContent() {
  const role = useChungsoraRole();
  if (role === null) return null;
  return role === 'parent' ? <ProposeReviewPanel /> : <ChildProposeSendPanel />;
}

export default function ProposePage() {
  return (
    <RoleShell>
      <ProposeContent />
    </RoleShell>
  );
}
