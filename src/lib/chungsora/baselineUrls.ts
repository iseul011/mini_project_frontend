import { resolveLogPhotoUrl } from '@/lib/api/resolveLogPhotoUrl';

export const BASELINE_SLOT_COUNT = 3;

/** 슬롯 인덱스(0=입구,1=바닥,2=책상)를 유지하며 URL 패딩 */
export function padBaselineUrls(
  raw: (string | null | undefined)[] | undefined,
  legacyUrl?: string | null,
): (string | null)[] {
  const padded: (string | null)[] = [null, null, null];
  if (raw && raw.length > 0) {
    for (let i = 0; i < BASELINE_SLOT_COUNT; i++) {
      const u = raw[i];
      const rawVal = u === null || u === undefined || u === '' ? null : String(u);
      padded[i] = rawVal ? resolveLogPhotoUrl(rawVal) : null;
    }
    return padded;
  }
  if (legacyUrl) {
    padded[0] = resolveLogPhotoUrl(legacyUrl);
  }
  return padded;
}

export function baselineSlotsReady(urls: (string | null)[]): boolean {
  return urls.filter(Boolean).length >= BASELINE_SLOT_COUNT;
}
