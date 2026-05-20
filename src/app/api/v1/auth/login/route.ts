import { NextRequest, NextResponse } from 'next/server';
import { upstreamUrl, UPSTREAM_MS } from '@/lib/api/bffUpstream';

const COOKIE = 'parent_session';
const MAX_AGE = 60 * 60 * 24 * 7;

function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const upstream = await fetch(upstreamUrl('/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(UPSTREAM_MS),
    });
    const data = await upstream.json();
    const res = NextResponse.json(data, { status: upstream.status });
    if (upstream.ok && data.token) setSessionCookie(res, data.token);
    return res;
  } catch {
    return NextResponse.json({ error: '백엔드 연결 실패' }, { status: 503 });
  }
}
