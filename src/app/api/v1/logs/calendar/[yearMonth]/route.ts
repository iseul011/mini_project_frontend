import { NextRequest } from 'next/server';
import { upstreamAuthHeaders } from '@/lib/api/bffAuth';
import { BFF_FAIL, proxyUpstreamJson } from '@/lib/api/bffProxyJson';
import { upstreamUrl, UPSTREAM_MS } from '@/lib/api/bffUpstream';

type Ctx = { params: Promise<{ yearMonth: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { yearMonth } = await ctx.params;
  try {
    const res = await fetch(upstreamUrl(`/logs/calendar/${encodeURIComponent(yearMonth)}`), {
      headers: upstreamAuthHeaders(req),
      signal: AbortSignal.timeout(UPSTREAM_MS),
    });
    return proxyUpstreamJson(res);
  } catch {
    return BFF_FAIL;
  }
}
