export type ApkVersion = {
  version: string;
  build_number: string;
  built_at: string | null;
  commit: string | null;
  package: string;
  apk_size_bytes?: number | null;
  note?: string;
};

export function formatBuiltAt(iso: string | null | undefined): string {
  if (!iso) return 'CI 빌드 대기 중';
  try {
    return new Date(iso).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  } catch {
    return iso;
  }
}

export function formatApkSize(bytes: number | null | undefined): string | null {
  if (bytes == null || bytes <= 0) return null;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function shortCommit(sha: string | null | undefined): string | null {
  if (!sha) return null;
  return sha.slice(0, 7);
}
