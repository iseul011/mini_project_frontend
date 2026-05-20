import { fetchJson } from '@/lib/api/fetchJson';
import { authHeaders } from '@/lib/api/authSession';
import type { ProposalThread } from '@/lib/chungsora/proposeStore';

const BASE = '/api/v1/child';

export type ChildProposeListResponse = { threads: ProposalThread[] };

export async function fetchChildProposals() {
  return fetchJson<ChildProposeListResponse>(`${BASE}/propose`, {
    headers: authHeaders(),
  });
}

export async function submitChildProposal(label: string, points: number) {
  return fetchJson<{ thread: ProposalThread }>(`${BASE}/propose`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ label, points }),
  });
}
