import { fetchJson } from '@/lib/api/fetchJson';
import { authHeaders } from '@/lib/api/authSession';

export async function fetchPointsBalance() {
  return fetchJson<{ balance: number }>('/api/v1/points', {
    headers: authHeaders(),
  });
}

export async function earnPoints(amount: number, label: string) {
  return fetchJson<{ balance: number }>('/api/v1/points', {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ kind: 'earn', amount, label }),
  });
}

export async function spendPoints(won: number, label: string) {
  return fetchJson<{ balance: number }>('/api/v1/points', {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ kind: 'spend', won, label }),
  });
}
