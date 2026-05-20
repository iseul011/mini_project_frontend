'use client';

import Link from 'next/link';
import { stopCoachSpeech } from '@/lib/chungsora/useCoachSpeech';

type CaptureBackLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export function CaptureBackLink({ href, children, className }: CaptureBackLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => stopCoachSpeech()}
    >
      {children}
    </Link>
  );
}
