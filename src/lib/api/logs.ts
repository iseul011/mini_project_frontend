import { fetchJson } from '@/lib/api/fetchJson';
import { authHeaders } from '@/lib/api/authSession';
import type { ChatEntry } from '@/components/chungsora/MessageComposer';
const BASE = '/api/v1/logs';

export type LogDetail = {
  date: string;
  score: number;
  streak_days: number;
  before_url: string | null;
  after_url: string | null;
  messages: ChatEntry[];
};

export type LogMessagesResponse = {
  date: string;
  messages: ChatEntry[];
};

export type PostLogMessageResponse = {
  message: ChatEntry;
};

export type UploadLogPhotoResponse = {
  date: string;
  phase: 'before' | 'after';
  url: string;
};

export type LogCalendarResponse = {
  year_month: string;
  dates: string[];
  points: number;
};

export async function fetchLogCalendar(year: number, month: number) {
  const ym = `${year}-${String(month).padStart(2, '0')}`;
  return fetchJson<LogCalendarResponse>(`${BASE}/calendar/${ym}`, {
    headers: authHeaders(),
  });
}

export async function fetchLogDetail(date: string) {
  return fetchJson<LogDetail>(`${BASE}/${encodeURIComponent(date)}`, {
    headers: authHeaders(),
  });
}

export async function fetchLogMessages(date: string) {
  return fetchJson<LogMessagesResponse>(`${BASE}/${encodeURIComponent(date)}/messages`, {
    headers: authHeaders(),
  });
}

export async function postLogMessage(
  date: string,
  payload: { role: 'parent' | 'child'; text: string; badge?: string },
) {
  return fetchJson<PostLogMessageResponse>(`${BASE}/${encodeURIComponent(date)}/messages`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
}

export async function uploadLogPhoto(
  date: string,
  phase: 'before' | 'after' | 'baseline',
  file: File | Blob,
) {
  const form = new FormData();
  form.append('file', file);
  return fetchJson<UploadLogPhotoResponse>(
    `${BASE}/${encodeURIComponent(date)}/photos?phase=${phase}`,
    { method: 'POST', headers: authHeaders(), body: form },
  );
}

export async function patchLogMeta(
  date: string,
  payload: { score?: number; streak_days?: number },
) {
  return fetchJson<LogDetail>(`${BASE}/${encodeURIComponent(date)}`, {
    method: 'PATCH',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
}