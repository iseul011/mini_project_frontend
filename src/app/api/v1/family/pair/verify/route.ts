import { NextRequest, NextResponse } from 'next/server';
import { CHILD_SESSION_COOKIE } from '@/lib/api/bffAuth';
import { upstreamUrl, UPSTREAM_MS } from '@/lib/api/bffUpstream';

const MAX_AGE = 60 * 60 * 24 * 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(upstreamUrl('/family/pair/verify'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(UPSTREAM_MS),
    });
    const data = await res.json();
    const out = NextResponse.json(data, { status: res.status });
    if (res.ok && data.device_token) {
      out.cookies.set(CHILD_SESSION_COOKIE, data.device_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: MAX_AGE,
      });
    }
    return out;
  } catch {
    return NextResponse.json({ error: '백엔드 연결 실패' }, { status: 503 });
  }
}
