import { NextRequest } from 'next/server';

const PARENT_COOKIE = 'parent_session';
const CHILD_COOKIE = 'child_session';

/** BFF → BE Authorization (쿠키 우선, 클라이언트 헤더 fallback) */
export function upstreamAuthHeaders(req: NextRequest): HeadersInit {
  const headers: Record<string, string> = {};
  const parent = req.cookies.get(PARENT_COOKIE)?.value;
  const child = req.cookies.get(CHILD_COOKIE)?.value;
  if (parent) headers.Authorization = `Bearer ${parent}`;
  else if (child) headers.Authorization = `Bearer ${child}`;
  const clientAuth = req.headers.get('authorization');
  if (clientAuth) headers.Authorization = clientAuth;
  return headers;
}

export function setParentSessionCookie(res: Response, token: string) {
  // used from route handlers via NextResponse
}

export const PARENT_SESSION_COOKIE = PARENT_COOKIE;
export const CHILD_SESSION_COOKIE = CHILD_COOKIE;
