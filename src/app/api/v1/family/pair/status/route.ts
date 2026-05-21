import { NextRequest } from 'next/server';
import { upstreamAuthHeaders } from '@/lib/api/bffAuth';
import { BFF_FAIL, proxyUpstreamJson } from '@/lib/api/bffProxyJson';
import { upstreamUrl, UPSTREAM_MS } from '@/lib/api/bffUpstream';

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code');
    if (!code) {
      return Response.json({ detail: 'code_required' }, { status: 400 });
    }
    const res = await fetch(
      upstreamUrl(`/family/pair/status?code=${encodeURIComponent(code)}`),
      {
        headers: upstreamAuthHeaders(req),
        signal: AbortSignal.timeout(UPSTREAM_MS),
      },
    );
    return proxyUpstreamJson(res);
  } catch {
    return BFF_FAIL;
  }
}
