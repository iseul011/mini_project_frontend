import Link from 'next/link';
import { ChevronLeft, Terminal, AlertTriangle, CheckCircle2 } from 'lucide-react';

const ADB_CMD = 'adb shell dpm set-device-owner com.chungsora.child/.ChungsoraDeviceAdminReceiver';

const ERRORS = [
  { err: 'Not allowed to set the device owner', fix: '공장 초기화 후 Wi‑Fi·Google 계정 설정 전 ADB 실행' },
  { err: 'Already has an owner', fix: '다른 MDM/DPC 제거 또는 공장 초기화' },
  { err: 'Unknown admin', fix: 'APK 설치 후 앱 1회 실행' },
] as const;

export function DeviceOwnerGuideContent() {
  return (
    <div className="min-h-screen bg-[#f7f9fa]">
      <main className="mx-auto w-full max-w-lg px-4 pb-10 pt-10">
        <Link
          href="/download"
          className="mb-6 inline-flex items-center gap-1 text-sm text-[#828c94] hover:text-[#2f3438]"
        >
          <ChevronLeft size={18} />
          다운로드
        </Link>

        <p className="text-[13px] font-semibold tracking-wide text-[#00B8CF]">CHUNGSORA</p>
        <h1 className="mt-1 text-[26px] font-bold text-[#2f3438]">Device Owner 설정</h1>
        <p className="mt-2 text-[15px] text-[#828c94]">
          OS 레벨 잠금(Lock Task)에 필요합니다. USB + ADB 방식(MVP).
        </p>

        <section className="ch-card mt-6 p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold">
            <CheckCircle2 size={18} className="text-[#00B8CF]" />
            사전 조건
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-[#828c94]">
            <li>· Android 7.0+ (API 24+)</li>
            <li>· 공장 초기화된 기기 (Google 계정 없음)</li>
            <li>· PC에 Android platform-tools (adb)</li>
            <li>· USB 디버깅 ON</li>
          </ul>
        </section>

        <section className="ch-card mt-4 p-5">
          <h2 className="text-sm font-bold">1. APK 설치</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[#828c94]">
            <li>
              <Link href="/download" className="text-[#00B8CF] underline-offset-2 hover:underline">
                /download
              </Link>
              에서 APK 다운로드
            </li>
            <li>「알 수 없는 앱」 설치 허용</li>
            <li>설치 후 앱 <strong className="text-[#2f3438]">한 번 실행</strong></li>
          </ol>
        </section>

        <section className="ch-card mt-4 p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold">
            <Terminal size={18} className="text-[#00B8CF]" />
            2. Device Owner 등록
          </h2>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-[#2f3438] p-4 text-xs leading-relaxed text-[#e8eaed]">
            {`adb devices\n${ADB_CMD}`}
          </pre>
          <p className="mt-3 text-xs text-[#828c94]">
            성공 시: <code className="text-[#2f3438]">Success: Device owner set to package com.chungsora.child</code>
          </p>
        </section>

        <section className="ch-card mt-4 p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold">
            <AlertTriangle size={18} className="text-[#f04452]" />
            자주 나는 오류
          </h2>
          <ul className="mt-3 space-y-3">
            {ERRORS.map((e) => (
              <li key={e.err} className="rounded-xl bg-[#f7f9fa] p-3 text-sm">
                <p className="font-mono text-xs text-[#f04452]">{e.err}</p>
                <p className="mt-1 text-[#828c94]">{e.fix}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="ch-card mt-4 p-5">
          <h2 className="text-sm font-bold">4. 배터리 최적화 (Phase 5 필수)</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[#828c94]">
            <li>자녀 앱 → 우상단 <strong className="text-[#2f3438]">E2E 진단</strong> → 「배터리 최적화 제외 요청」</li>
            <li>삼성/小米 등: 설정 → 배터리 → 청소해라 「제한 없음」</li>
            <li>알림 「잠금 스케줄 감시 중」 유지 확인 (17:00 E2E)</li>
          </ol>
        </section>

        <section className="ch-card mt-4 p-5">
          <h2 className="text-sm font-bold">5. 앱에서 확인</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[#828c94]">
            <li>홈 → Device Owner: <strong className="text-[#2f3438]">등록됨 ✓</strong></li>
            <li>부모 PWA 페어링 코드 → 자녀 앱 연결</li>
            <li>테스트 잠금 → Lock Task · 홈 버튼 차단 확인</li>
            <li>청소 AI 합격 → 잠금 해제 E2E</li>
          </ol>
        </section>

        <section className="ch-card mt-4 p-5">
          <h2 className="text-sm font-bold">Device Owner 해제</h2>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-[#f7f9fa] p-3 text-xs text-[#828c94]">
            adb shell dpm remove-active-admin com.chungsora.child/.ChungsoraDeviceAdminReceiver
          </pre>
        </section>
      </main>
    </div>
  );
}
