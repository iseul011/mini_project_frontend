'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { logoutParent } from '@/lib/chungsora/authStore';

const ROWS = [
  {
    section: '청소 · 잠금',
    items: [
      { label: '청소 스케줄', href: '/parent/more/schedule', trailing: '월·수·금 17:00' },
      { label: '잠금 해제 기준', href: '/parent/more/lock', trailing: '70점' },
      { label: '잠금 중 허용', href: '/parent/more/lock', trailing: '전화 ON' },
      { label: '자녀 관리 · 연결 코드', href: '/parent/pair' },
      { label: '커스텀 칭찬 관리', href: '/parent/more/praise' },
    ],
  },
  {
    section: '앱 · 계정',
    items: [
      { label: '알림 설정', href: '/parent/more/notifications' },
      { label: '로그아웃', action: 'logout' as const },
      { label: '버전', trailing: '1.0.0' },
      { label: '이용약관 · 개인정보', href: '/parent/more/legal' },
    ],
  },
];

export default function ParentMorePage() {
  const router = useRouter();

  const handleLogout = () => {
    logoutParent();
    router.replace('/parent/login');
  };

  return (
    <>
      <header className="px-5 pb-2 pt-4">
        <h1 className="text-[22px] font-bold text-[#2f3438]">더보기</h1>
        <p className="mt-1 text-[13px] text-[#828c94]">설정 · 계정 · 앱 정보</p>
      </header>

      <div className="flex flex-col gap-4 px-5 pb-6">
        {ROWS.map(({ section, items }) => (
          <div key={section} className="ch-card overflow-hidden">
            <p className="border-b border-[#f0f2f4] px-4 py-3 text-xs font-bold text-[#828c94]">{section}</p>
            <ul>
              {items.map((item) => (
                <li key={item.label}>
                  {'action' in item && item.action === 'logout' ? (
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center justify-between px-4 py-3.5 text-left text-sm text-[#2f3438] hover:bg-[#f7f9fa]"
                    >
                      <span>{item.label}</span>
                      <ChevronRight size={18} className="text-[#adb5bd]" />
                    </button>
                  ) : 'href' in item && item.href ? (
                    <Link
                      href={item.href}
                      className="flex w-full items-center justify-between px-4 py-3.5 text-left text-sm text-[#2f3438] hover:bg-[#f7f9fa]"
                    >
                      <span>{item.label}</span>
                      <span className="flex items-center gap-1 text-[#adb5bd]">
                        {'trailing' in item && item.trailing ? (
                          <span className="text-xs text-[#828c94]">{item.trailing}</span>
                        ) : null}
                        <ChevronRight size={18} />
                      </span>
                    </Link>
                  ) : (
                    <div className="flex w-full items-center justify-between px-4 py-3.5 text-sm text-[#2f3438]">
                      <span>{item.label}</span>
                      {'trailing' in item && item.trailing ? (
                        <span className="text-xs text-[#828c94]">{item.trailing}</span>
                      ) : null}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
