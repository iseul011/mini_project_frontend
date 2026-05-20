import { NextRequest, NextResponse } from 'next/server';
import { upstreamAuthHeaders } from '@/lib/api/bffAuth';
import { upstreamUrl, UPSTREAM_MS } from '@/lib/api/bffUpstream';

type Ctx = { params: Promise<{ yearMonth: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { yearMonth } = await ctx.params;
  try {
    const res = await fetch(upstreamUrl(`/logs/calendar/${encodeURIComponent(yearMonth)}`), {
      headers: upstreamAuthHeaders(req),
      signal: AbortSignal.timeout(UPSTREAM_MS),
    });
    return NextResponse.json(await res.json(), { status: res.status });
  } catch {
    return NextResponse.json({ error: '백엔드 연결 실패' }, { status: 503 });
  }
}
