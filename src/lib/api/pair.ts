import { fetchJson } from '@/lib/api/fetchJson';
import { authHeaders } from '@/lib/api/authSession';

export type PairIssueResponse = {
  code: string;
  expires_at: string;
  ttl_seconds: number;
  link_path: string;
};

export type PairVerifyResponse = {
  ok: boolean;
  code?: string;
  reason?: string;
  device_token?: string;
  device_id?: string;
};

export type PairStatusResponse = {
  code: string;
  code_used: boolean;
  child_paired: boolean;
};

export async function fetchPairCodeStatus(code: string) {
  const q = encodeURIComponent(code.trim().toUpperCase());
  return fetchJson<PairStatusResponse>(`/api/v1/family/pair/status?code=${q}`, {
    headers: authHeaders(),
  });
}

export async function issuePairCode(childDisplayName?: string) {
  const name = childDisplayName?.trim();
  return fetchJson<PairIssueResponse>('/api/v1/family/pair/issue', {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(name ? { child_display_name: name } : {}),
  });
}

export type PairRefreshResponse = {
  ok: boolean;
  reason?: string;
  device_token?: string;
  device_id?: string;
  parent_account_id?: number;
};

export async function verifyPairCode(code: string) {
  return fetchJson<PairVerifyResponse>('/api/v1/family/pair/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
}

/** 등록된 기기 토큰만 갱신 — 부모·자녀 연결(DB)은 유지 */
export async function refreshChildDeviceToken(deviceId: string) {
  return fetchJson<PairRefreshResponse>('/api/v1/family/pair/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ device_id: deviceId }),
  });
}
