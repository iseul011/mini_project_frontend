import { NextRequest } from 'next/server';
import { upstreamAuthHeaders } from '@/lib/api/bffAuth';
import { BFF_FAIL, proxyUpstreamJson } from '@/lib/api/bffProxyJson';
import { upstreamUrl, UPSTREAM_MS } from '@/lib/api/bffUpstream';

type Ctx = { params: Promise<{ date: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { date } = await ctx.params;
  try {
    const res = await fetch(upstreamUrl(`/logs/${encodeURIComponent(date)}/messages`), {
      headers: upstreamAuthHeaders(req),
      signal: AbortSignal.timeout(UPSTREAM_MS),
    });
    return proxyUpstreamJson(res);
  } catch {
    return BFF_FAIL;
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
    return proxyUpstreamJson(res);
  } catch {
    return BFF_FAIL;
  }
}
