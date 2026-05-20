import { NextRequest } from 'next/server';
import { upstreamAuthHeaders } from '@/lib/api/bffAuth';
import { BFF_FAIL, proxyUpstreamJsonMapped } from '@/lib/api/bffProxyJson';
import { resolveLogPhotoUrl } from '@/lib/api/resolveLogPhotoUrl';
import { upstreamUrl, UPSTREAM_MS } from '@/lib/api/bffUpstream';

type Ctx = { params: Promise<{ date: string }> };

function mapLogDetail(data: Record<string, unknown>) {
  return {
    ...data,
    before_url: resolveLogPhotoUrl(data.before_url as string | null),
    after_url: resolveLogPhotoUrl(data.after_url as string | null),
  };
}

export async function GET(req: NextRequest, ctx: Ctx) {
  const { date } = await ctx.params;
  try {
    const res = await fetch(upstreamUrl(`/logs/${encodeURIComponent(date)}`), {
      headers: upstreamAuthHeaders(req),
      signal: AbortSignal.timeout(UPSTREAM_MS),
    });
    return proxyUpstreamJsonMapped(res, mapLogDetail);
  } catch {
    return BFF_FAIL;
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { date } = await ctx.params;
  try {
    const body = await req.json();
    const res = await fetch(upstreamUrl(`/logs/${encodeURIComponent(date)}`), {
      method: 'PATCH',
      headers: { ...upstreamAuthHeaders(req), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(UPSTREAM_MS),
    });
    return proxyUpstreamJsonMapped(res, mapLogDetail);
  } catch {
    return BFF_FAIL;
  }
}
