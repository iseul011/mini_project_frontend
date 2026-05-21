import { fetchJson } from '@/lib/api/fetchJson';

export type AuthResponse = {
  ok: boolean;
  token: string;
  id: number;
  login_id: string;
  display_name: string;
  onboard_done?: boolean;
  child_display_name?: string;
};

export type MeResponse = {
  id: number;
  login_id: string;
  display_name: string;
  onboard_done: boolean;
  child_display_name: string;
  points_balance: number;
  base_clean_won: number;
  lock_time: string;
  lock_days: string;
  pass_score: number;
  notification_prefs?: Record<string, boolean>;
  token: string;
};

export async function loginParent(loginId: string, password: string) {
  return fetchJson<AuthResponse>('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login_id: loginId, password }),
  });
}

export async function signupParent(
  loginId: string,
  password: string,
  displayName: string,
) {
  return fetchJson<AuthResponse>('/api/v1/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      login_id: loginId,
      password,
      display_name: displayName,
    }),
  });
}

export async function fetchParentMe() {
  return fetchJson<MeResponse>('/api/v1/auth/me', {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function logoutParentSession() {
  await fetch('/api/v1/auth/logout', { method: 'POST' });
}

export async function logoutChildSession() {
  await fetch('/api/v1/auth/logout/child', { method: 'POST' });
}
