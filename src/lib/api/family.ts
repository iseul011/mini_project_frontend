import { fetchJson } from '@/lib/api/fetchJson';
import { authHeaders } from '@/lib/api/authSession';

export type FamilySummary = {
  child_display_name: string;
  points_balance: number;
  base_clean_won: number;
  streak_days: number;
  streak_mult: number;
  lock_time: string;
  lock_days: string;
  pass_score: number;
  onboard_done: boolean;
  today_score: number;
};

export async function fetchFamilySummary() {
  return fetchJson<FamilySummary>('/api/v1/family/summary', {
    headers: authHeaders(),
  });
}

export async function updateFamilyProfile(body: Record<string, unknown>) {
  return fetchJson<Record<string, unknown>>('/api/v1/family/summary', {
    method: 'PATCH',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });
}
