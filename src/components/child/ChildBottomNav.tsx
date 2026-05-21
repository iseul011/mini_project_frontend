'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, Handshake, ShoppingBag, User } from 'lucide-react';
import { setRole } from '@/lib/chungsora/role';
import { BottomNavIcon } from '@/components/chungsora/BottomNavIcon';

const LEFT = [
  { label: '홈', href: '/child/home', Icon: Home, filledWhenActive: true },
  { label: '로그', href: '/log', Icon: ClipboardList },
] as const;

const RIGHT = [
  { label: '포인트 상점', href: '/child/points', Icon: ShoppingBag },
  { label: '나', href: '/child/me', Icon: User, filledWhenActive: true },
] as const;

function tabActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function tabLabelClass(active: boolean) {
  return `text-[10px] ${active ? 'font-semibold text-[#1a1e22]' : 'font-normal text-[#8e8e8e]'}`;
}

export function ChildBottomNav() {
  const pathname = usePathname();
  const proposeOn = tabActive(pathname, '/propose') || tabActive(pathname, '/child/propose');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#dbdbdb] bg-white safe-bottom">
      <div className="mx-auto flex max-w-lg items-end justify-around px-2 pt-1.5">
        {LEFT.map(({ label, href, Icon, ...rest }) => {
          const filledWhenActive = 'filledWhenActive' in rest ? rest.filledWhenActive : undefined;
          const on = tabActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setRole('child')}
              className="flex min-w-0 flex-1 flex-col items-center gap-1 py-2"
            >
              <BottomNavIcon icon={Icon} active={on} filledWhenActive={filledWhenActive} />
              <span className={tabLabelClass(on)}>{label}</span>
            </Link>
          );
        })}

        <Link
          href="/propose"
          onClick={() => setRole('child')}
          className="relative -top-2 flex min-w-[56px] flex-col items-center gap-1"
        >
          <span
            className={[
              'flex h-11 w-11 items-center justify-center rounded-full',
              proposeOn ? 'bg-[#1a1e22] text-white' : 'bg-transparent text-[#8e8e8e]',
            ].join(' ')}
          >
            <Handshake size={26} strokeWidth={proposeOn ? 2.25 : 1.75} aria-hidden />
          </span>
          <span className={tabLabelClass(proposeOn)}>제안</span>
        </Link>

        {RIGHT.map(({ label, href, Icon, ...rest }) => {
          const filledWhenActive = 'filledWhenActive' in rest ? rest.filledWhenActive : undefined;
          const on = tabActive(pathname, href);
          return (
            <Link key={href} href={href} onClick={() => setRole('child')} className="flex min-w-0 flex-1 flex-col items-center gap-1 py-2">
              <BottomNavIcon icon={Icon} active={on} filledWhenActive={filledWhenActive} />
              <span className={tabLabelClass(on)}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
