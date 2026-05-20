import { normalizeApiBaseUrl } from '@/lib/api/backendBaseUrl';

export const API_URL = normalizeApiBaseUrl(process.env.API_URL);
export const UPSTREAM_MS = 110_000;

export function upstreamUrl(path: string) {
  if (!API_URL) {
    throw new Error('API_URL is not configured');
  }
  return `${API_URL}/api/v1${path}`;
}
