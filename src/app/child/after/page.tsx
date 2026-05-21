import { redirect } from 'next/navigation';

export default function ChildAfterRedirect() {
  redirect('/child/mission/after');
}
