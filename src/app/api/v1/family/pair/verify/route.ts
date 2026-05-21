import { NextRequest, NextResponse } from 'next/server';
import { CHILD_SESSION_COOKIE } from '@/lib/api/bffAuth';
import { BFF_FAIL, readUpstreamJson } from '@/lib/api/bffProxyJson';
import { upstreamUrl, UPSTREAM_MS } from '@/lib/api/bffUpstream';

/** 자녀 device JWT(365일)와 맞춤 */
const MAX_AGE = 60 * 60 * 24 * 365;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(upstreamUrl('/family/pair/verify'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(UPSTREAM_MS),
    });
    const { status, data } = await readUpstreamJson(res);
    const out = NextResponse.json(data, { status });
    const deviceToken = (data as { device_token?: string })?.device_token;
    if (res.ok && deviceToken) {
      out.cookies.set(CHILD_SESSION_COOKIE, deviceToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: MAX_AGE,
      });
    }
    return out;
  } catch {
    return BFF_FAIL;
  }
}
