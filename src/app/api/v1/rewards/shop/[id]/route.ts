import { NextRequest, NextResponse } from 'next/server';
import { upstreamAuthHeaders } from '@/lib/api/bffAuth';
import { upstreamUrl, UPSTREAM_MS } from '@/lib/api/bffUpstream';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const body = await req.json();
    const res = await fetch(upstreamUrl(`/rewards/shop/${id}`), {
      method: 'PATCH',
      headers: { ...upstreamAuthHeaders(req), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(UPSTREAM_MS),
    });
    return NextResponse.json(await res.json(), { status: res.status });
  } catch {
    return NextResponse.json({ error: '백엔드 연결 실패' }, { status: 503 });
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const res = await fetch(upstreamUrl(`/rewards/shop/${id}`), {
      method: 'DELETE',
      headers: upstreamAuthHeaders(req),
      signal: AbortSignal.timeout(UPSTREAM_MS),
    });
    return NextResponse.json(await res.json(), { status: res.status });
  } catch {
    return NextResponse.json({ error: '백엔드 연결 실패' }, { status: 503 });
  }
}
