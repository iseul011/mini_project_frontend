'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { setRole } from '@/lib/chungsora/role';

const LEFT = [
  { label: '홈', href: '/child/home', icon: '🏠' },
  { label: '로그', href: '/log', icon: '📋' },
] as const;

function tabActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ChildBottomNav() {
  const pathname = usePathname();
  const proposeOn = tabActive(pathname, '/propose') || tabActive(pathname, '/child/propose');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#eaedef] bg-white safe-bottom">
      <div className="mx-auto flex max-w-lg items-end justify-around px-2 pt-1">
        {LEFT.map(({ label, href, icon }) => {
          const on = tabActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setRole('child')}
              className="flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2"
            >
              <span className={`text-[20px] ${on ? 'opacity-100' : 'opacity-45'}`}>{icon}</span>
              <span className={`text-[10px] ${on ? 'font-bold text-[#2f3438]' : 'font-medium text-[#adb5bd]'}`}>{label}</span>
            </Link>
          );
        })}

        <Link
          href="/propose"
          onClick={() => setRole('child')}
          className="relative -top-3 flex min-w-[56px] flex-col items-center gap-1"
        >
          <span className={`flex h-12 w-12 items-center justify-center rounded-full text-[22px] shadow-sm ${proposeOn ? 'bg-[#e8f8fb] ring-2 ring-[#00b8cf]' : 'bg-[#f0f2f4]'}`}>
            🤝
          </span>
          <span className={`text-[10px] ${proposeOn ? 'font-bold text-[#2f3438]' : 'font-medium text-[#adb5bd]'}`}>제안</span>
        </Link>

        <Link href="/child/points" className="flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2">
          <span className={`text-base font-bold ${tabActive(pathname, '/child/points') ? 'text-[#2f3438]' : 'text-[#adb5bd]'}`}>P</span>
          <span className={`text-[10px] ${tabActive(pathname, '/child/points') ? 'font-bold text-[#2f3438]' : 'font-medium text-[#adb5bd]'}`}>P상점</span>
        </Link>

        <Link href="/child/me" className="flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2">
          <span className={`text-[20px] ${tabActive(pathname, '/child/me') ? 'opacity-100' : 'opacity-45'}`}>👤</span>
          <span className={`text-[10px] ${tabActive(pathname, '/child/me') ? 'font-bold text-[#2f3438]' : 'font-medium text-[#adb5bd]'}`}>나</span>
        </Link>
      </div>
      <div className="mx-auto mb-1 mt-0.5 h-1 w-28 rounded-full bg-[#eaedef]/80" />
    </nav>
  );
}
