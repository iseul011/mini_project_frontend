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

export async function issuePairCode() {
  return fetchJson<PairIssueResponse>('/api/v1/family/pair/issue', {
    headers: authHeaders(),
  });
}

export async function verifyPairCode(code: string) {
  return fetchJson<PairVerifyResponse>('/api/v1/family/pair/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
}
