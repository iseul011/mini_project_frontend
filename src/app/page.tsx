'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { setRole } from '@/lib/chungsora/role';

const ROLES = [
  {
    label: '부모',
    href: '/parent/login',
    emoji: '🏠',
    desc: '퀘스트·제안·보상 관리',
    role: 'parent' as const,
    iconBg: 'bg-[rgba(0,184,207,0.12)]',
    hoverBorder: 'hover:border-[#00B8CF]',
  },
  {
    label: '자녀',
    href: '/child/pair',
    emoji: '👧',
    desc: '청소·퀘스트·P상점',
    role: 'child' as const,
    iconBg: 'bg-pink-50',
    hoverBorder: 'hover:border-pink-200',
  },
] as const;

export default function EntryPage() {
  return (
    <div className="min-h-screen bg-[#f7f9fa]">
      <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col">
        <header className="border-b border-[#eaedef] bg-white px-5 pb-10 pt-14 text-center">
          <p className="text-[13px] font-semibold tracking-wide text-[#00B8CF]">CHUNGSORA</p>
          <h1 className="mt-2 text-[28px] font-bold text-[#2f3438]">청소해라</h1>
          <p className="mt-2 text-[15px] text-[#828c94]">누구로 시작할까요?</p>
        </header>

        <ul className="flex flex-col gap-3 px-4 py-6">
          {ROLES.map((role) => (
            <li key={role.href}>
              <Link
                href={role.href}
                onClick={() => setRole(role.role)}
                className={`flex items-center gap-4 rounded-2xl border border-[#eaedef] bg-white p-5 transition-colors ${role.hoverBorder}`}
              >
                <span className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${role.iconBg}`}>
                  {role.emoji}
                </span>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-lg font-bold text-[#2f3438]">{role.label}</p>
                  <p className="mt-1 text-sm text-[#828c94]">{role.desc}</p>
                </div>
                <ChevronRight size={20} className="shrink-0 text-[#c2c8cc]" />
              </Link>
            </li>
          ))}
        </ul>

        <footer className="mt-auto px-4 pb-8 text-center">
          <Link
            href="/download"
            className="mb-3 block text-sm font-medium text-[#00B8CF] underline-offset-2 hover:underline"
          >
            자녀 Android 앱 APK 다운로드
          </Link>
          <Link href="/hub" className="text-xs text-[#adb5bd] underline-offset-2 hover:text-[#828c94] hover:underline">
            개발용 · 미니 프로젝트 허브
          </Link>
        </footer>
      </main>
    </div>
  );
}
