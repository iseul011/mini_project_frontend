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

  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);



  useEffect(() => {

    if (!hydrated || !parentLoggedIn) return;

    router.replace(getParentHomePath(onboardDone));

  }, [hydrated, parentLoggedIn, onboardDone, router]);



  const handleSignup = async (e: React.FormEvent) => {

    e.preventDefault();

    setError('');

    setLoading(true);

    setRole('parent');

    try {

      const res = await signupParent(loginId.trim(), password, displayName.trim());

      setParentSession({

        loginId: res.login_id,

        displayName: res.display_name,

        token: res.token,

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



  return (

    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-5 py-10">

      <Link href="/parent/login" className="text-xs font-semibold text-[#00b8cf]">← 로그인</Link>

      <h1 className="mt-4 text-[26px] font-bold text-[#2f3438]">회원가입</h1>

      <p className="mt-2 text-sm text-[#828c94]">Neon DB에 부모 계정을 등록해요</p>



      <form onSubmit={(e) => void handleSignup(e)} className="mt-8 flex flex-col gap-4">

        <input

          value={displayName}

          onChange={(e) => setDisplayName(e.target.value)}

          placeholder="이름 (표시명)"

          className="rounded-xl border border-[#eaedef] px-4 py-3.5 text-sm outline-none focus:border-[#00b8cf]"

        />

        <input

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

          placeholder="비밀번호 (4자 이상)"

          autoComplete="new-password"

          className="rounded-xl border border-[#eaedef] px-4 py-3.5 text-sm outline-none focus:border-[#00b8cf]"

        />

        {error ? <p className="text-center text-xs text-red-500">{error}</p> : null}

        <button

          type="submit"

          disabled={loading || loginId.trim().length < 2 || password.length < 4}

          className="ch-btn-primary py-4 text-[15px] disabled:opacity-50"

        >

          {loading ? '가입 중…' : '가입하기'}

        </button>

      </form>

    </div>

  );

}

