export function normalizeApiBaseUrl(env: string | undefined): string {
  const localFallback =
    process.env.MINI_LOCAL_API_URL?.trim() || "http://127.0.0.1:37651";

  if (!env?.trim()) {
    if (process.env.VERCEL_ENV === "production") {
      return "";
    }
    return normalizeApiBaseUrlInner(localFallback);
  }
  const normalized = normalizeApiBaseUrlInner(env.trim());
  if (process.env.VERCEL_ENV === "production" && !normalized) {
    return "";
  }
  return normalized || normalizeApiBaseUrlInner(localFallback);
}

function normalizeApiBaseUrlInner(raw: string): string {
  let s = raw.replace(/\/+$/, "");
  if (s.endsWith("/api/v1")) {
    s = s.slice(0, -"/api/v1".length).replace(/\/+$/, "");
  }
  return s;
}
