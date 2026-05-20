'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getChildHomePath,
  getParentHomePath,
} from '@/lib/chungsora/authRoutes';
import { useAuthStore } from '@/lib/chungsora/authStore';
import { useAuthHydrated } from '@/lib/chungsora/useAuthHydrated';
import { setRole } from '@/lib/chungsora/role';
import { AuthLoading } from '@/components/chungsora/AuthLoading';

const ENTRIES = [
  {
    label: '부모 화면',
    emoji: '🏠',
    desc: '퀘스트 · 제안 · 보상 · 로그',
    role: 'parent' as const,
    className: 'hover:border-[#00B8CF] active:bg-[rgba(0,184,207,0.06)]',
    emojiBg: 'bg-[rgba(0,184,207,0.12)]',
  },
  {
    label: '자녀 화면',
    emoji: '👧',
    desc: '청소 · 퀘스트 · P상점 · 제안',
    role: 'child' as const,
    className: 'hover:border-pink-300 active:bg-pink-50/50',
    emojiBg: 'bg-pink-50',
  },
] as const;

export default function MainEntryPage() {
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const parentLoggedIn = useAuthStore((s) => s.parentLoggedIn);
  const onboardDone = useAuthStore((s) => s.onboardDone);
  const childPaired = useAuthStore((s) => s.childPaired);

  const enter = (role: 'parent' | 'child') => {
    setRole(role);
    if (role === 'parent') {
      router.push(
        parentLoggedIn ? getParentHomePath(onboardDone) : '/parent/login',
      );
      return;
    }
    router.push(childPaired ? getChildHomePath() : '/child/pair');
  };

  if (!hydrated) {
    return <AuthLoading />;
  }

  return (
    <div className="min-h-screen bg-[#f7f9fa]">
      <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-5 py-12">
        <header className="mb-10 text-center">
          <p className="text-[13px] font-semibold tracking-wide text-[#00B8CF]">CHUNGSORA</p>
          <h1 className="mt-2 text-[28px] font-bold text-[#2f3438]">청소해라</h1>
          <p className="mt-2 text-[15px] text-[#828c94]">PWA · 부모 · 자녀</p>
        </header>

        <div className="flex flex-col gap-4">
          {ENTRIES.map((entry) => (
            <button
              key={entry.role}
              type="button"
              onClick={() => enter(entry.role)}
              className={`flex flex-col items-center rounded-2xl border border-[#eaedef] bg-white px-6 py-8 text-center transition-colors ${entry.className}`}
            >
              <span className={`flex h-16 w-16 items-center justify-center rounded-2xl text-4xl ${entry.emojiBg}`}>
                {entry.emoji}
              </span>
              <p className="mt-4 text-lg font-bold text-[#2f3438]">{entry.label}</p>
              <p className="mt-1 text-sm text-[#828c94]">{entry.desc}</p>
            </button>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-[#adb5bd]">
          미로그인 시 로그인 · 미연결 시 페어링 화면으로 이동합니다
        </p>
        <Link href="/hub" className="mt-3 text-center text-xs text-[#828c94] underline">
          미니 프로젝트 허브
        </Link>
      </main>
    </div>
  );
}
