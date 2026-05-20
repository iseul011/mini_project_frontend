'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type TabId = 'home' | 'log' | 'propose' | 'rewards' | 'more';

const LEFT: { id: TabId; label: string; href: string; icon: string }[] = [
  { id: 'home', label: '홈', href: '/parent/home', icon: '🏠' },
  { id: 'log', label: '로그', href: '/log', icon: '📋' },
];

const RIGHT: { id: TabId; label: string; href: string; icon: string }[] = [
  { id: 'rewards', label: '보상', href: '/parent/rewards', icon: '⭐' },
  { id: 'more', label: '더보기', href: '/parent/more', icon: '☰' },
];

function tabActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ParentBottomNav({ proposeBadge }: { proposeBadge?: number }) {
  const pathname = usePathname();
  const proposeOn = tabActive(pathname, '/propose') || tabActive(pathname, '/parent/propose');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#eaedef] bg-white safe-bottom">
      <div className="mx-auto flex max-w-lg items-end justify-around px-2 pt-1">
        {LEFT.map(({ id, label, href, icon }) => {
          const on = tabActive(pathname, href);
          return (
            <Link key={id} href={href} className="flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2">
              <span className={`text-[20px] ${on ? 'opacity-100' : 'opacity-45'}`}>{icon}</span>
              <span className={`text-[10px] ${on ? 'font-bold text-[#2f3438]' : 'font-medium text-[#adb5bd]'}`}>{label}</span>
            </Link>
          );
        })}

        <Link href="/propose" className="relative -top-3 flex min-w-[56px] flex-col items-center gap-1">
          <span className={`flex h-12 w-12 items-center justify-center rounded-full text-[22px] shadow-sm ${proposeOn ? 'bg-[#e8f8fb] ring-2 ring-[#00b8cf]' : 'bg-[#f0f2f4]'}`}>
            🤝
          </span>
          {proposeBadge != null && proposeBadge > 0 && (
            <span className="absolute -right-0.5 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#00b8cf] px-1 text-[9px] font-bold text-white">
              {proposeBadge}
            </span>
          )}
          <span className={`text-[10px] ${proposeOn ? 'font-bold text-[#2f3438]' : 'font-medium text-[#adb5bd]'}`}>제안</span>
        </Link>

        {RIGHT.map(({ id, label, href, icon }) => {
          const on = tabActive(pathname, href);
          return (
            <Link key={id} href={href} className="flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2">
              <span className={`text-[18px] ${on ? 'opacity-100' : 'opacity-45'}`}>{icon}</span>
              <span className={`text-[10px] ${on ? 'font-bold text-[#2f3438]' : 'font-medium text-[#adb5bd]'}`}>{label}</span>
            </Link>
          );
        })}
      </div>
      <div className="mx-auto mb-1 mt-0.5 h-1 w-28 rounded-full bg-[#eaedef]/80" />
    </nav>
  );
}
