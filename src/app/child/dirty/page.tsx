import { redirect } from 'next/navigation';

export default function ChildDirtyRedirect() {
  redirect('/child/mission/before');
}
