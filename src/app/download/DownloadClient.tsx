'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  Download,
  Shield,
  Smartphone,
  Sparkles,
  Lock,
  Camera,
  ExternalLink,
} from 'lucide-react';
import { AppScreenshotMocks } from '@/components/download/AppScreenshotMocks';
import { DownloadQrPanel } from '@/components/download/DownloadQrPanel';
import {
  formatApkSize,
  formatBuiltAt,
  shortCommit,
  type ApkVersion,
} from '@/lib/download/apkMeta';
import { deferEffect } from '@/lib/react/deferEffect';

const FEATURES = [
  { icon: Lock, title: '기기 잠금 (DPC)', desc: '17:00 자동 · Lock Task' },
  { icon: Camera, title: 'AI 청소 검증', desc: 'baseline 비교 · 합격 시 해제' },
  { icon: Sparkles, title: '포인트 적립', desc: '스트릭 배율 · P 상점' },
] as const;

export function DownloadClient() {
  const [info, setInfo] = useState<ApkVersion | null>(null);
  const [apkReady, setApkReady] = useState(false);
  const [apkSizeBytes, setApkSizeBytes] = useState<number | null>(null);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    deferEffect(() => setOrigin(window.location.origin));
    fetch('/apk/version.json', { cache: 'no-store' })
      .then((r) => r.json())
      .then(setInfo)
      .catch(() => undefined);
    fetch('/apk/app-release.apk', { method: 'HEAD', cache: 'no-store' })
      .then((r) => {
        setApkReady(r.ok);
        const len = r.headers.get('content-length');
        if (len) setApkSizeBytes(parseInt(len, 10));
      })
      .catch(() => setApkReady(false));
  }, []);

  const pageUrl = origin ? `${origin}/download` : '/download';
  const apkUrl = origin ? `${origin}/apk/app-release.apk` : '/apk/app-release.apk';

  const sizeLabel = useMemo(() => {
    const fromJson = formatApkSize(info?.apk_size_bytes);
    const fromHead = formatApkSize(apkSizeBytes);
    return fromJson ?? fromHead;
  }, [info?.apk_size_bytes, apkSizeBytes]);

  const commitShort = shortCommit(info?.commit);

  return (
    <div className="min-h-screen bg-[#f7f9fa]">
      <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col">
        <header className="border-b border-[#eaedef] bg-white px-4 pb-6 pt-10">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-1 text-sm text-[#828c94] hover:text-[#2f3438]"
          >
            <ChevronLeft size={18} />
            홈
          </Link>
          <p className="text-[13px] font-semibold tracking-wide text-[#00B8CF]">CHUNGSORA</p>
          <h1 className="mt-1 text-[26px] font-bold text-[#2f3438]">청소해라 · 자녀 앱</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-[#828c94]">
            Android 전용. 청소하면 풀리는 폰 — 기기 잠금 + AI 검증.
          </p>
        </header>

        <div className="flex flex-col gap-4 px-4 py-6">
          {/* P4-1 앱 소개 · 기능 */}
          <section className="grid grid-cols-3 gap-2">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-[#eaedef] bg-white p-3 text-center"
              >
                <Icon size={20} className="mx-auto text-[#00B8CF]" />
                <p className="mt-2 text-[11px] font-bold text-[#2f3438]">{title}</p>
                <p className="mt-0.5 text-[10px] leading-snug text-[#adb5bd]">{desc}</p>
              </div>
            ))}
          </section>

          {/* P4-1 스크린샷 미리보기 */}
          <section className="ch-card p-5">
            <h2 className="text-sm font-bold text-[#2f3438]">앱 미리보기</h2>
            <p className="mt-1 text-xs text-[#828c94]">잠금 → 청소 → 해제 플로우</p>
            <div className="mt-4">
              <AppScreenshotMocks />
            </div>
          </section>

          {/* P4-3 APK · 버전 */}
          <section className="ch-card p-5">
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[rgba(0,184,207,0.12)] text-3xl">
                📱
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[#2f3438]">청소해라 (자녀)</p>
                <p className="mt-1 text-sm text-[#828c94]">
                  v{info?.version ?? '0.3.0'}
                  {info?.build_number ? ` · build ${info.build_number}` : ''}
                  {sizeLabel ? ` · ${sizeLabel}` : ''}
                </p>
                <p className="mt-1 text-xs text-[#adb5bd]">{formatBuiltAt(info?.built_at)}</p>
                {commitShort && (
                  <p className="mt-0.5 font-mono text-[10px] text-[#c2c8cc]">commit {commitShort}</p>
                )}
                {info?.package && (
                  <p className="mt-0.5 font-mono text-[10px] text-[#c2c8cc]">{info.package}</p>
                )}
              </div>
            </div>

            {apkReady ? (
              <a
                href="/apk/app-release.apk"
                download="chungsora-child.apk"
                className="ch-btn-primary mt-5 flex w-full items-center justify-center gap-2 py-4 text-[15px] font-semibold"
              >
                <Download size={20} />
                APK 다운로드
              </a>
            ) : (
              <div className="mt-5 rounded-xl bg-[#f7f9fa] px-4 py-4 text-center text-sm text-[#828c94]">
                APK 파일이 아직 없습니다.
                <br />
                GitHub Actions <code className="text-xs">build-apk</code> 실행 후 다시 확인해 주세요.
              </div>
            )}
          </section>

          {/* P4-2 QR */}
          {origin && (
            <DownloadQrPanel pageUrl={pageUrl} apkUrl={apkUrl} apkReady={apkReady} />
          )}

          {/* 설치 · P4-4 Device Owner 가이드 */}
          <section className="ch-card p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[#2f3438]">
              <Smartphone size={18} className="text-[#00B8CF]" />
              설치 방법
            </h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[#828c94]">
              <li>APK 다운로드 또는 QR 스캔</li>
              <li>「알 수 없는 앱」 설치 허용</li>
              <li>부모 PWA에서 페어링 코드 → 자녀 앱 입력</li>
              <li>
                Device Owner 등록 (잠금 필수) —{' '}
                <Link
                  href="/download/device-owner"
                  className="inline-flex items-center gap-0.5 font-medium text-[#00B8CF] underline-offset-2 hover:underline"
                >
                  설정 가이드
                  <ExternalLink size={12} />
                </Link>
              </li>
            </ol>
          </section>

          <section className="ch-card p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[#2f3438]">
              <Shield size={18} className="text-[#f04452]" />
              잠금 → 청소 → 해제
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-[#828c94]">
              <li>· 부모 설정 시간(예: 17:00) 자동 잠금</li>
              <li>· 유튜브·게임·카톡 차단 · 전화 허용 가능</li>
              <li>· 3곳 촬영 + AI baseline 비교</li>
              <li>· pass_score 합격 → OS 잠금 해제 + P 적립</li>
            </ul>
          </section>
        </div>

        <footer className="mt-auto px-4 pb-8 text-center text-xs text-[#adb5bd]">
          Android · DPC · v{info?.version ?? '0.3.0'}
          {' · '}
          <Link href="/download/device-owner" className="underline-offset-2 hover:underline">
            Device Owner
          </Link>
        </footer>
      </main>
    </div>
  );
}
