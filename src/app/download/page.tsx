import type { Metadata } from 'next';
import { DownloadClient } from './DownloadClient';

export const metadata: Metadata = {
  title: '앱 다운로드 · 청소해라',
  description: '청소해라 자녀 Android 앱 APK — 기기 잠금 DPC, AI 청소 검증, QR 설치',
  openGraph: {
    title: '청소해라 자녀 앱 다운로드',
    description: 'Android APK · 잠금하면 청소해야 풀리는 폰',
  },
};

export default function DownloadPage() {
  return <DownloadClient />;
}
