import { NextRequest, NextResponse } from 'next/server';
import { upstreamAuthHeaders } from '@/lib/api/bffAuth';
import { BFF_FAIL, readUpstreamJson } from '@/lib/api/bffProxyJson';
import { resolveLogPhotoUrl } from '@/lib/api/resolveLogPhotoUrl';
import { upstreamUrl, UPSTREAM_MS } from '@/lib/api/bffUpstream';

type Ctx = { params: Promise<{ date: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const { date } = await ctx.params;
  const phase = req.nextUrl.searchParams.get('phase');
  const slot = req.nextUrl.searchParams.get('slot');
  if (phase !== 'before' && phase !== 'after' && phase !== 'baseline') {
    return NextResponse.json({ error: 'phase=before|after|baseline 필요' }, { status: 400 });
  }

  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: 'file 필드 필요' }, { status: 400 });
    }

    const upstream = new FormData();
    upstream.append('file', file, 'capture.bin');

    const qs = new URLSearchParams({ phase });
    if (slot !== null && slot !== '') qs.set('slot', slot);

    const res = await fetch(
      `${upstreamUrl(`/logs/${encodeURIComponent(date)}/photos`)}?${qs.toString()}`,
      {
        method: 'POST',
        headers: upstreamAuthHeaders(req),
        body: upstream,
        signal: AbortSignal.timeout(UPSTREAM_MS),
      },
    );

    const { status, data } = await readUpstreamJson(res);
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      const record = data as Record<string, unknown>;
      if (typeof record.url === 'string') {
        record.url = resolveLogPhotoUrl(record.url);
      }
      return NextResponse.json(record, { status });
    }
    return NextResponse.json(data, { status });
  } catch {
    return BFF_FAIL;
  }
}
