import { redirect } from 'next/navigation';

/** /s → 자녀 앱 */
export default function LegacyChildEntryPage() {
  redirect('/child/home');
}
