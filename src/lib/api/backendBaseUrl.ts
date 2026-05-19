import { DEFAULT_VERCEL_API_URL } from "./vercelEnvDefaults";

export function normalizeApiBaseUrl(env: string | undefined): string {
  const prodFallback = normalizeApiBaseUrlInner(DEFAULT_VERCEL_API_URL);
  const fallback =
    process.env.VERCEL_ENV === "production"
      ? prodFallback
      : process.env.MINI_LOCAL_API_URL?.trim() || "http://127.0.0.1:37651";
  if (!env?.trim()) return fallback;
  const normalized = normalizeApiBaseUrlInner(env.trim());
  return normalized || fallback;
}

function normalizeApiBaseUrlInner(raw: string): string {
  let s = raw.replace(/\/+$/, "");
  if (s.endsWith("/api/v1")) {
    s = s.slice(0, -"/api/v1".length).replace(/\/+$/, "");
  }
  return s;
}
