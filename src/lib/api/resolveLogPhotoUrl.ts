/** 업로드 사진 → same-origin BFF 프록시 URL (HTTPS 페이지에서 EC2 http URL 혼합 콘텐츠 방지) */
export function resolveLogPhotoUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.pathname.startsWith('/uploads/')) {
        return `/api/v1${parsed.pathname}`;
      }
    } catch {
      return trimmed;
    }
    return trimmed;
  }

  if (trimmed.startsWith('/api/v1/uploads/')) return trimmed;
  if (trimmed.startsWith('/uploads/')) return `/api/v1${trimmed}`;
  if (trimmed.startsWith('/')) return `/api/v1${trimmed}`;
  return trimmed;
}
