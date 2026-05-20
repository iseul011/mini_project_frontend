import { NextRequest } from 'next/server';
import { upstreamAuthHeaders } from '@/lib/api/bffAuth';
import { BFF_FAIL, proxyUpstreamJson } from '@/lib/api/bffProxyJson';
import { upstreamUrl, UPSTREAM_MS } from '@/lib/api/bffUpstream';

type Ctx = { params: Promise<{ threadId: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const { threadId } = await ctx.params;
  try {
    const res = await fetch(upstreamUrl(`/parent/propose/${threadId}/accept`), {
      method: 'POST',
      headers: upstreamAuthHeaders(req),
      signal: AbortSignal.timeout(UPSTREAM_MS),
    });
    return proxyUpstreamJson(res);
  } catch {
    return BFF_FAIL;
  }
}
