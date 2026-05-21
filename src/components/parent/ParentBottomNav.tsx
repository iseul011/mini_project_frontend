'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, Handshake, Gift, Menu } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BottomNavIcon } from '@/components/chungsora/BottomNavIcon';

type TabId = 'home' | 'log' | 'propose' | 'rewards' | 'more';

const LEFT: { id: TabId; label: string; href: string; Icon: LucideIcon; filledWhenActive?: boolean }[] = [
  { id: 'home', label: '홈', href: '/parent/home', Icon: Home, filledWhenActive: true },
  { id: 'log', label: '로그', href: '/log', Icon: ClipboardList },
];

const RIGHT: { id: TabId; label: string; href: string; Icon: LucideIcon; filledWhenActive?: boolean }[] = [
  { id: 'rewards', label: '보상', href: '/parent/rewards', Icon: Gift },
  { id: 'more', label: '더보기', href: '/parent/more', Icon: Menu },
];

function tabActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function tabLabelClass(active: boolean) {
  return `text-[10px] ${active ? 'font-semibold text-[#1a1e22]' : 'font-normal text-[#8e8e8e]'}`;
}

export function ParentBottomNav({ proposeBadge }: { proposeBadge?: number }) {
  const pathname = usePathname();
  const proposeOn = tabActive(pathname, '/propose') || tabActive(pathname, '/parent/propose');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#dbdbdb] bg-white safe-bottom">
      <div className="mx-auto flex max-w-lg items-end justify-around px-2 pt-1.5">
        {LEFT.map(({ id, label, href, Icon, filledWhenActive }) => {
          const on = tabActive(pathname, href);
          return (
            <Link key={id} href={href} className="flex min-w-0 flex-1 flex-col items-center gap-1 py-2">
              <BottomNavIcon icon={Icon} active={on} filledWhenActive={filledWhenActive} />
              <span className={tabLabelClass(on)}>{label}</span>
            </Link>
          );
        })}

        <Link href="/propose" className="relative -top-2 flex min-w-[56px] flex-col items-center gap-1">
          <span
            className={[
              'flex h-11 w-11 items-center justify-center rounded-full',
              proposeOn ? 'bg-[#1a1e22] text-white' : 'bg-transparent text-[#8e8e8e]',
            ].join(' ')}
          >
            <Handshake size={26} strokeWidth={proposeOn ? 2.25 : 1.75} aria-hidden />
          </span>
          {proposeBadge != null && proposeBadge > 0 && (
            <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff3040] px-1 text-[9px] font-bold text-white">
              {proposeBadge}
            </span>
          )}
          <span className={tabLabelClass(proposeOn)}>제안</span>
        </Link>

        {RIGHT.map(({ id, label, href, Icon, filledWhenActive }) => {
          const on = tabActive(pathname, href);
          return (
            <Link key={id} href={href} className="flex min-w-0 flex-1 flex-col items-center gap-1 py-2">
              <BottomNavIcon icon={Icon} active={on} filledWhenActive={filledWhenActive} />
              <span className={tabLabelClass(on)}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
