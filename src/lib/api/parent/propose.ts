import { fetchJson } from '@/lib/api/fetchJson';
import { authHeaders } from '@/lib/api/authSession';
import type { ProposalThread } from '@/lib/chungsora/proposeStore';

const BASE = '/api/v1/parent';

export type ParentProposeListResponse = { threads: ProposalThread[] };

export async function fetchParentProposals() {
  return fetchJson<ParentProposeListResponse>(`${BASE}/propose`, {
    headers: authHeaders(),
  });
}

export async function acceptParentProposal(threadId: string) {
  return fetchJson<{ ok: boolean }>(`${BASE}/propose/${threadId}/accept`, {
    method: 'POST',
    headers: authHeaders(),
  });
}

export async function rejectParentProposal(threadId: string, reason: string) {
  return fetchJson<{ ok: boolean }>(`${BASE}/propose/${threadId}/reject`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ reason }),
  });
}
