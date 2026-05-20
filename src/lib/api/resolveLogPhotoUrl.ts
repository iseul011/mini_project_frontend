/** 업로드 사진 → same-origin BFF 프록시 URL */
export function resolveLogPhotoUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads/')) return `/api/v1${url}`;
  if (url.startsWith('/')) return `/api/v1${url}`;
  return url;
}
