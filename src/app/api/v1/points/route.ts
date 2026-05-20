import { NextRequest, NextResponse } from 'next/server';
import { upstreamAuthHeaders } from '@/lib/api/bffAuth';
import { upstreamUrl, UPSTREAM_MS } from '@/lib/api/bffUpstream';

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(upstreamUrl('/points/balance'), {
      headers: upstreamAuthHeaders(req),
      signal: AbortSignal.timeout(UPSTREAM_MS),
    });
    return NextResponse.json(await res.json(), { status: res.status });
  } catch {
    return NextResponse.json({ error: '백엔드 연결 실패' }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const path = body.kind === 'spend' ? '/points/spend' : '/points/earn';
    const res = await fetch(upstreamUrl(path), {
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
