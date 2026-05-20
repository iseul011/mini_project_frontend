import { NextRequest, NextResponse } from 'next/server';
import { upstreamAuthHeaders } from '@/lib/api/bffAuth';
import { upstreamUrl, UPSTREAM_MS } from '@/lib/api/bffUpstream';

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(upstreamUrl('/family/summary'), {
      headers: upstreamAuthHeaders(req),
      signal: AbortSignal.timeout(UPSTREAM_MS),
    });
    return NextResponse.json(await res.json(), { status: res.status });
  } catch {
    return NextResponse.json({ error: '백엔드 연결 실패' }, { status: 503 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(upstreamUrl('/family/profile'), {
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
