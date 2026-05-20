import { redirect } from 'next/navigation';

export default function ChildLogRedirect() {
  redirect('/log');
}
