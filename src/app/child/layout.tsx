import { ChildShell } from '@/components/child/ChildShell';

export default function ChildLayout({ children }: { children: React.ReactNode }) {
  return <ChildShell>{children}</ChildShell>;
}
