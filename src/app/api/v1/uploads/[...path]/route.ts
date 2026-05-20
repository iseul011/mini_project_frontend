import { NextRequest, NextResponse } from 'next/server';
import { API_URL, UPSTREAM_MS } from '@/lib/api/bffUpstream';

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  if (!API_URL) {
    return NextResponse.json({ error: 'API_URL is not configured' }, { status: 503 });
  }
  const subpath = path.join('/');
  try {
    const res = await fetch(`${API_URL}/uploads/${subpath}`, {
      signal: AbortSignal.timeout(UPSTREAM_MS),
    });
    if (!res.ok) {
      return NextResponse.json({ error: 'not found' }, { status: res.status });
    }
    const contentType = res.headers.get('content-type') ?? 'application/octet-stream';
    const body = await res.arrayBuffer();
    return new NextResponse(body, {
      status: 200,
      headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=3600' },
    });
  } catch {
    return NextResponse.json({ error: '백엔드 연결 실패' }, { status: 503 });
  }
}
