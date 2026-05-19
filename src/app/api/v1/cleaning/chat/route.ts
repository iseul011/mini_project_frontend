import { NextRequest, NextResponse } from "next/server";
import { normalizeApiBaseUrl } from "@/lib/api/backendBaseUrl";

const API_URL = normalizeApiBaseUrl(process.env.API_URL);
const UPSTREAM_MS = 110_000;

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const h: Record<string, string> = { "Content-Type": "application/json" };
  const auth = req.headers.get("authorization");
  if (auth) h["Authorization"] = auth;
  try {
    const res = await fetch(`${API_URL}/api/v1/cleaning/chat`, {
      method: "POST",
      headers: h,
      body,
      signal: AbortSignal.timeout(UPSTREAM_MS),
    });
    return NextResponse.json(await res.json(), { status: res.status });
  } catch {
    return NextResponse.json({ error: "백엔드 연결 실패" }, { status: 503 });
  }
}
