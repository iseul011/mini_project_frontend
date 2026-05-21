import { NextRequest } from 'next/server';
import { upstreamAuthHeaders } from '@/lib/api/bffAuth';
import { BFF_FAIL, proxyUpstreamJson } from '@/lib/api/bffProxyJson';
import { upstreamUrl, UPSTREAM_MS } from '@/lib/api/bffUpstream';

async function proxyIssue(req: NextRequest) {
  let body: Record<string, unknown> = {};
  if (req.method === 'POST') {
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      body = {};
    }
  }
  const res = await fetch(upstreamUrl('/family/pair/issue'), {
    method: 'POST',
    headers: { ...upstreamAuthHeaders(req), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(UPSTREAM_MS),
  });
  return proxyUpstreamJson(res);
}

/** @deprecated GET — POST 사용 권장 */
export async function GET(req: NextRequest) {
  try {
    return await proxyIssue(req);
  } catch {
    return BFF_FAIL;
  }
}

export async function POST(req: NextRequest) {
  try {
    return await proxyIssue(req);
  } catch {
    return BFF_FAIL;
  }
}
