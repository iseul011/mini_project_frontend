'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check } from 'lucide-react';

type DownloadQrPanelProps = {
  pageUrl: string;
  apkUrl: string | null;
  apkReady: boolean;
};

export function DownloadQrPanel({ pageUrl, apkUrl, apkReady }: DownloadQrPanelProps) {
  const [copied, setCopied] = useState<'page' | 'apk' | null>(null);
  const qrTarget = apkReady && apkUrl ? apkUrl : pageUrl;
  const qrLabel = apkReady ? 'APK 직접 설치 QR' : '다운로드 페이지 QR';

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(null), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async (text: string, kind: 'page' | 'apk') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
    } catch {
      /* ignore */
    }
  };

  return (
    <section className="ch-card p-5">
      <h2 className="text-sm font-bold text-[#2f3438]">QR로 설치</h2>
      <p className="mt-1 text-xs text-[#828c94]">
        {apkReady
          ? '자녀 폰 카메라로 스캔 → APK 다운로드'
          : 'APK 빌드 전 — 페이지 QR만 표시됩니다'}
      </p>
      <div className="mt-4 flex items-center gap-5">
        <div className="shrink-0 rounded-xl border border-[#eaedef] bg-white p-3">
          <QRCodeSVG value={qrTarget} size={148} level="M" marginSize={1} />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="text-[11px] font-semibold text-[#adb5bd]">{qrLabel}</p>
            <p className="mt-0.5 break-all font-mono text-[10px] text-[#828c94]">{qrTarget}</p>
          </div>
          <button
            type="button"
            onClick={() => copy(qrTarget, apkReady ? 'apk' : 'page')}
            className="ch-btn-secondary inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? '복사됨' : '링크 복사'}
          </button>
          {!apkReady && (
            <button
              type="button"
              onClick={() => copy(pageUrl, 'page')}
              className="block text-xs text-[#00B8CF] underline-offset-2 hover:underline"
            >
              페이지 URL만 복사
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
