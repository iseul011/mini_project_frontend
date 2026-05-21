'use client';

import { usePathname } from 'next/navigation';
import { MissionStepper, type MissionStep } from '@/components/chungsora/MissionStepper';

function stepFromPath(pathname: string): MissionStep | null {
  if (pathname.startsWith('/child/lock')) return 1;
  if (pathname.includes('/mission/before')) return 2;
  if (pathname.includes('/mission/quest')) return 3;
  if (pathname.includes('/mission/after')) return 4;
  if (pathname.startsWith('/child/unlock')) return 5;
  return null;
}

export default function ChildMissionLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const step = stepFromPath(pathname);
  return (
    <div className="flex min-h-dvh flex-col bg-[#f7f9fa]">
      {step !== null && <MissionStepper current={step} />}
      {children}
    </div>
  );
}
