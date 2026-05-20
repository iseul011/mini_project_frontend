import { NextRequest, NextResponse } from 'next/server';
import { upstreamAuthHeaders } from '@/lib/api/bffAuth';
import { upstreamUrl, UPSTREAM_MS } from '@/lib/api/bffUpstream';

type Ctx = { params: Promise<{ date: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { date } = await ctx.params;
  try {
    const res = await fetch(upstreamUrl(`/logs/${encodeURIComponent(date)}/messages`), {
      headers: upstreamAuthHeaders(req),
      signal: AbortSignal.timeout(UPSTREAM_MS),
    });
    return NextResponse.json(await res.json(), { status: res.status });
  } catch {
    return NextResponse.json({ error: '백엔드 연결 실패' }, { status: 503 });
  }
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { date } = await ctx.params;
  try {
    const body = await req.json();
    const res = await fetch(upstreamUrl(`/logs/${encodeURIComponent(date)}/messages`), {
      method: 'POST',
      headers: { ...upstreamAuthHeaders(req), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(UPSTREAM_MS),
    });
    return NextResponse.json(await res.json(), { status: res.status });
  } catch {
    return NextResponse.json({ error: '백엔드 연결 실패' }, { status: 503 });
  }
}
