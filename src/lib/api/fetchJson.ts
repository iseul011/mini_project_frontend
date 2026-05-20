import { UPLOAD_TOO_LARGE_MESSAGE } from '@/lib/api/uploadLimits';

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const text = await res.text();
  let data: (T & { error?: string }) | null = null;

  if (text.trim()) {
    try {
      data = JSON.parse(text) as T & { error?: string };
    } catch {
      if (res.status === 413 || text.includes('FUNCTION_PAYLOAD_TOO_LARGE')) {
        throw new Error(UPLOAD_TOO_LARGE_MESSAGE);
      }
      const snippet = text.trim().slice(0, 120);
      throw new Error(snippet || `서버 응답 오류 (${res.status})`);
    }
  } else {
    data = {} as T & { error?: string };
  }

  if (!res.ok) {
    if (res.status === 413) {
      throw new Error(UPLOAD_TOO_LARGE_MESSAGE);
    }
    throw new Error(data?.error ?? `요청 실패 (${res.status})`);
  }
  return data as T;
}
