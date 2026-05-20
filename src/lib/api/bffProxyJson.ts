import { NextResponse } from 'next/server';

/** upstream fetch 응답을 JSON으로 안전하게 BFF 클라이언트에 전달 */
export async function proxyUpstreamJson(res: Response): Promise<NextResponse> {
  const text = await res.text();
  if (!text.trim()) {
    return NextResponse.json({}, { status: res.status });
  }
  try {
    return NextResponse.json(JSON.parse(text) as unknown, { status: res.status });
  } catch {
    return NextResponse.json({ error: text }, { status: res.status });
  }
}
