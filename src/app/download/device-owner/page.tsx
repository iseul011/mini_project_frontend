import type { Metadata } from 'next';
import { DeviceOwnerGuideContent } from '@/components/download/DeviceOwnerGuideContent';

export const metadata: Metadata = {
  title: 'Device Owner 설정 · 청소해라',
  description: '청소해라 자녀 앱 Android DPC · ADB Device Owner 등록 가이드',
};

export default function DeviceOwnerPage() {
  return <DeviceOwnerGuideContent />;
}
