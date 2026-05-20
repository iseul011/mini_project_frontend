import { NextResponse } from 'next/server';

export const BFF_FAIL = NextResponse.json({ error: '백엔드 연결 실패' }, { status: 503 });

/** upstream body → { status, data } (res.json() 1회 대체) */
export async function readUpstreamJson(
  res: Response,
): Promise<{ status: number; data: unknown }> {
  const text = await res.text();
  if (!text.trim()) {
    return { status: res.status, data: {} };
  }
  try {
    return { status: res.status, data: JSON.parse(text) as unknown };
  } catch {
    return { status: res.status, data: { error: text } };
  }
}

/** upstream fetch 응답을 JSON으로 안전하게 BFF 클라이언트에 전달 */
export async function proxyUpstreamJson(res: Response): Promise<NextResponse> {
  const { status, data } = await readUpstreamJson(res);
  return NextResponse.json(data, { status });
}

/** JSON 파싱 후 map 적용 (로그 URL rewrite 등) */
export async function proxyUpstreamJsonMapped(
  res: Response,
  map: (data: Record<string, unknown>) => unknown,
): Promise<NextResponse> {
  const { status, data } = await readUpstreamJson(res);
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    return NextResponse.json(map(data as Record<string, unknown>), { status });
  }
  return NextResponse.json(data, { status });
}
