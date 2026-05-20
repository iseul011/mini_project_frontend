import { fetchJson } from '@/lib/api/fetchJson';
import { authHeaders } from '@/lib/api/authSession';

export type ShopReward = {
  id: string;
  label: string;
  won: number;
};

export type DailyQuest = {
  id: string;
  title: string;
  description: string;
  active: boolean;
};

export async function fetchShopRewards() {
  return fetchJson<{ rewards: ShopReward[] }>('/api/v1/rewards/shop', {
    headers: authHeaders(),
  });
}

export async function createShopReward(label: string, won: number) {
  return fetchJson<{ rewards: ShopReward[] }>('/api/v1/rewards/shop', {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ label, won }),
  });
}

export async function updateShopReward(id: string, payload: { label?: string; won?: number }) {
  return fetchJson<{ rewards: ShopReward[] }>(`/api/v1/rewards/shop/${id}`, {
    method: 'PATCH',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
}

export async function deleteShopReward(id: string) {
  return fetchJson<{ rewards: ShopReward[] }>(`/api/v1/rewards/shop/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}

export async function fetchDailyQuests() {
  return fetchJson<{ quests: DailyQuest[] }>('/api/v1/rewards/daily-quests', {
    headers: authHeaders(),
  });
}

export async function createDailyQuest(title: string, description = '') {
  return fetchJson<{ quests: DailyQuest[] }>('/api/v1/rewards/daily-quests', {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ title, description }),
  });
}

export async function deleteDailyQuest(id: string) {
  return fetchJson<{ quests: DailyQuest[] }>(`/api/v1/rewards/daily-quests/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}
