'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { stopCoachSpeech } from '@/lib/chungsora/useCoachSpeech';

/** 촬영 코치 TTS가 쓰이는 경로 */
export const CHUNGSORA_CAPTURE_PATHS = [
  '/parent/onboard/baseline',
  '/child/dirty',
  '/child/after',
  '/child/mission/before',
  '/child/mission/after',
] as const;

export function isChungsoraCapturePath(pathname: string): boolean {
  return CHUNGSORA_CAPTURE_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** 촬영 화면을 벗어나면 브라우저 TTS 즉시 중단 (뒤로가기·탭 이동 포함) */
export function useStopCoachOnLeaveCapture(): void {
  const pathname = usePathname();

  useEffect(() => {
    if (!isChungsoraCapturePath(pathname)) {
      stopCoachSpeech();
    }
  }, [pathname]);
}
