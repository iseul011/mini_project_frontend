import { fetchJson } from '@/lib/api/fetchJson';

const BASE = '/api/v1/praise-presets';

export type PraisePresetsResponse = {
  presets: string[];
};

export async function fetchPraisePresets() {
  return fetchJson<PraisePresetsResponse>(BASE);
}

export async function addPraisePreset(phrase: string) {
  return fetchJson<PraisePresetsResponse>(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phrase }),
  });
}

export async function deletePraisePreset(phrase: string) {
  return fetchJson<PraisePresetsResponse>(
    `${BASE}?phrase=${encodeURIComponent(phrase)}`,
    { method: 'DELETE' },
  );
}
