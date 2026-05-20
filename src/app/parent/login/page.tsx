'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { loginParent } from '@/lib/chungsora/clientApi';
import { getParentHomePath } from '@/lib/chungsora/authRoutes';
import { useAuthStore } from '@/lib/chungsora/authStore';
import { useAuthHydrated } from '@/lib/chungsora/useAuthHydrated';
import { setRole } from '@/lib/chungsora/role';
import { AuthLoading } from '@/components/chungsora/AuthLoading';

function ParentLoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hydrated = useAuthHydrated();
  const parentLoggedIn = useAuthStore((s) => s.parentLoggedIn);
  const onboardDone = useAuthStore((s) => s.onboardDone);
  const setParentSession = useAuthStore((s) => s.setParentSession);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hydrated || !parentLoggedIn) return;
    router.replace(getParentHomePath(onboardDone));
  }, [hydrated, parentLoggedIn, onboardDone, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setRole('parent');
    try {
      const res = await loginParent(loginId.trim(), password);
      setParentSession({
        loginId: res.login_id,
        displayName: res.display_name,
        token: res.token,
      });
      const next = searchParams.get('next');
      const safeNext =
        next?.startsWith('/parent/') && !next.startsWith('/parent/login') && !next.startsWith('/parent/signup')
          ? next
          : null;
      router.push(safeNext ?? (onboardDone ? '/parent/home' : '/parent/pair'));
    } catch {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated || parentLoggedIn) {
    return <AuthLoading />;
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-5 py-10">
      <h1 className="text-[26px] font-bold text-[#2f3438]">로그인</h1>
      <p className="mt-2 text-sm text-[#828c94]">부모 계정으로 청소해라를 시작해요</p>
      <form onSubmit={(e) => void handleLogin(e)} className="mt-8 flex flex-col gap-4">
        <input
          type="text"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          placeholder="아이디"
          autoComplete="username"
          className="rounded-xl border border-[#eaedef] px-4 py-3.5 text-sm outline-none focus:border-[#00b8cf]"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          autoComplete="current-password"
          className="rounded-xl border border-[#eaedef] px-4 py-3.5 text-sm outline-none focus:border-[#00b8cf]"
        />
        {error ? <p className="text-center text-xs text-red-500">{error}</p> : null}
        <button
          type="submit"
          disabled={loading || !loginId.trim() || !password}
          className="ch-btn-primary py-4 text-[15px] disabled:opacity-50"
        >
          {loading ? '로그인 중…' : '로그인'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-[#828c94]">
        계정이 없나요?{' '}
        <Link href="/parent/signup" className="font-semibold text-[#00b8cf]">
          회원가입
        </Link>
      </p>
    </div>
  );
}

export default function ParentLoginPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <ParentLoginInner />
    </Suspense>
  );
}
