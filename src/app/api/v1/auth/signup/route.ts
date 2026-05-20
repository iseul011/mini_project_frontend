import { NextRequest, NextResponse } from 'next/server';
import { BFF_FAIL, readUpstreamJson } from '@/lib/api/bffProxyJson';
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
    const upstream = await fetch(upstreamUrl('/auth/signup'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(UPSTREAM_MS),
    });
    const { status, data } = await readUpstreamJson(upstream);
    const out = NextResponse.json(data, { status });
    const token = (data as { token?: string })?.token;
    if (upstream.ok && token) setSessionCookie(out, token);
    return out;
  } catch {
    return BFF_FAIL;
  }
}
