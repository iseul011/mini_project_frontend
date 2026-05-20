import { NextRequest, NextResponse } from "next/server";
import { normalizeApiBaseUrl } from "@/lib/api/backendBaseUrl";
import { proxyUpstreamJson } from "@/lib/api/bffProxyJson";

const API_URL = normalizeApiBaseUrl(process.env.API_URL);
const UPSTREAM_MS = 30_000;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const h: Record<string, string> = { "Content-Type": "application/json" };
  try {
    const res = await fetch(`${API_URL}/api/v1/cleaning/memory`, {
      method: "POST",
      headers: h,
      body,
      signal: AbortSignal.timeout(UPSTREAM_MS),
    });
    return proxyUpstreamJson(res);
  } catch {
    return NextResponse.json({ error: "백엔드 연결 실패" }, { status: 503 });
  }
}
