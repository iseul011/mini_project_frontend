import { NextRequest, NextResponse } from 'next/server';
import { upstreamAuthHeaders } from '@/lib/api/bffAuth';
import { resolveLogPhotoUrl } from '@/lib/api/resolveLogPhotoUrl';
import { upstreamUrl, UPSTREAM_MS } from '@/lib/api/bffUpstream';

type Ctx = { params: Promise<{ date: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const { date } = await ctx.params;
  const phase = req.nextUrl.searchParams.get('phase');
  if (phase !== 'before' && phase !== 'after') {
    return NextResponse.json({ error: 'phase=before|after 필요' }, { status: 400 });
  }

  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: 'file 필드 필요' }, { status: 400 });
    }

    const upstream = new FormData();
    upstream.append('file', file, 'photo.jpg');

    const res = await fetch(
      `${upstreamUrl(`/logs/${encodeURIComponent(date)}/photos`)}?phase=${phase}`,
      {
        method: 'POST',
        headers: upstreamAuthHeaders(req),
        body: upstream,
        signal: AbortSignal.timeout(UPSTREAM_MS),
      },
    );
    const data = await res.json();
    if (data.url) {
      data.url = resolveLogPhotoUrl(data.url);
    }
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: '백엔드 연결 실패' }, { status: 503 });
  }
}
