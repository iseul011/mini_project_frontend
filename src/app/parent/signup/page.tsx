'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { signupParent } from '@/lib/chungsora/clientApi';
import { getParentHomePath } from '@/lib/chungsora/authRoutes';
import { useAuthStore } from '@/lib/chungsora/authStore';
import { useAuthHydrated } from '@/lib/chungsora/useAuthHydrated';
import { setRole } from '@/lib/chungsora/role';
import { AuthLoading } from '@/components/chungsora/AuthLoading';

export default function ParentSignupPage() {
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const parentLoggedIn = useAuthStore((s) => s.parentLoggedIn);
  const onboardDone = useAuthStore((s) => s.onboardDone);
  const setParentSession = useAuthStore((s) => s.setParentSession);

  const [loginId, setLoginId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hydrated || !parentLoggedIn) return;
    router.replace(getParentHomePath(onboardDone));
  }, [hydrated, parentLoggedIn, onboardDone, router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않아요.');
      return;
    }

    setLoading(true);
    setRole('parent');
    try {
      const res = await signupParent(loginId.trim(), password, displayName.trim());
      setParentSession({
        loginId: res.login_id,
        displayName: res.display_name,
        token: res.token,
        onboardDone: res.onboard_done ?? false,
      });
      router.push('/parent/pair');
    } catch {
      setError('가입에 실패했어요. 아이디가 이미 사용 중일 수 있어요.');
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated || parentLoggedIn) {
    return <AuthLoading />;
  }

  const isValid =
    displayName.trim().length > 0 &&
    loginId.trim().length >= 2 &&
    password.length >= 4 &&
    passwordConfirm.length >= 4;

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-5 py-10">
      <Link href="/parent/login" className="text-[13px] font-semibold text-[#00b8cf]">
        ← 로그인
      </Link>

      <div className="mt-6">
        <h1 className="text-[26px] font-bold tracking-[-0.3px] text-[#1a1e22]">회원가입</h1>
        <p className="mt-1.5 text-[14px] text-[#828c94]">부모 계정을 만들고 자녀와 연결해요</p>
      </div>

      <form onSubmit={(e) => void handleSignup(e)} className="mt-8 flex flex-col gap-3.5">
        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-medium text-[#828c94]">이름 (표시명)</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="예: 김부모"
            className="rounded-xl border border-[#eaedef] bg-[#f7f9fa] px-4 py-3.5 text-[15px] text-[#1a1e22] outline-none placeholder:text-[#c4c9cf] focus:border-[#00b8cf] focus:bg-white transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-medium text-[#828c94]">아이디</label>
          <input
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            placeholder="영문·숫자 2자 이상"
            autoComplete="username"
            className="rounded-xl border border-[#eaedef] bg-[#f7f9fa] px-4 py-3.5 text-[15px] text-[#1a1e22] outline-none placeholder:text-[#c4c9cf] focus:border-[#00b8cf] focus:bg-white transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-medium text-[#828c94]">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="4자 이상"
            autoComplete="new-password"
            className="rounded-xl border border-[#eaedef] bg-[#f7f9fa] px-4 py-3.5 text-[15px] text-[#1a1e22] outline-none placeholder:text-[#c4c9cf] focus:border-[#00b8cf] focus:bg-white transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-medium text-[#828c94]">비밀번호 확인</label>
          <input
            type="password"
            value={passwordConfirm}
            onChange={(e) => { setPasswordConfirm(e.target.value); setError(''); }}
            placeholder="비밀번호를 한 번 더 입력해요"
            autoComplete="new-password"
            className={[
              'rounded-xl border bg-[#f7f9fa] px-4 py-3.5 text-[15px] text-[#1a1e22] outline-none placeholder:text-[#c4c9cf] transition-colors focus:bg-white',
              passwordConfirm && password !== passwordConfirm
                ? 'border-[#e03131] focus:border-[#e03131]'
                : 'border-[#eaedef] focus:border-[#00b8cf]',
            ].join(' ')}
          />
          {passwordConfirm && password !== passwordConfirm && (
            <p className="text-[12px] text-[#e03131]">비밀번호가 일치하지 않아요.</p>
          )}
        </div>

        {error ? (
          <p className="rounded-xl bg-[#fff0f0] px-4 py-3 text-[13px] font-medium text-[#e03131]">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading || !isValid || password !== passwordConfirm}
          className="ch-btn-primary mt-2 py-4 text-[15px] font-bold disabled:opacity-40"
        >
          {loading ? '가입 중…' : '가입하기'}
        </button>
      </form>
    </div>
  );
}
