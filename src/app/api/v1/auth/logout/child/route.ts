import { NextRequest, NextResponse } from 'next/server';
import { CHILD_SESSION_COOKIE } from '@/lib/api/bffAuth';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(CHILD_SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
