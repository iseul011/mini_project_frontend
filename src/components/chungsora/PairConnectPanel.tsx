'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Copy, Share2 } from 'lucide-react';
import { issuePairCode, type PairIssueResponse } from '@/lib/chungsora/clientApi';
import { deferEffect } from '@/lib/react/deferEffect';

export function PairConnectPanel() {
  const [pair, setPair] = useState<PairIssueResponse | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);

  const load = useCallback(async () => {
    setLoadError('');
    setNeedsLogin(false);
    try {
      const res = await issuePairCode();
      setPair(res);
      setSecondsLeft(res.ttl_seconds);
    } catch (err) {
      setPair(null);
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('401')) {
        setNeedsLogin(true);
        return;
      }
      setLoadError('코드를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
    }
  }, []);

  useEffect(() => {
    deferEffect(() => {
      void load();
    });
  }, [load]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [secondsLeft, pair?.code]);

  useEffect(() => {
    if (secondsLeft === 0 && pair) {
      deferEffect(() => {
        void load();
      });
    }
  }, [secondsLeft, pair, load]);

  const fullLink = useMemo(() => {
    if (!pair || typeof window === 'undefined') return '';
    return `${window.location.origin}${pair.link_path}`;
  }, [pair]);

  const qrUrl = fullLink
    ? `https://quickchart.io/qr?text=${encodeURIComponent(fullLink)}&size=200&margin=1`
    : '';

  const copyText = async (text: string, kind: 'code' | 'link') => {
    await navigator.clipboard.writeText(text);
    setCopied(kind);
    setTimeout(() => setCopied(null), 2000);
  };

  const shareLink = async () => {
    if (!fullLink || !pair) return;
    if (navigator.share) {
      await navigator.share({
        title: '청소해라 연결',
        text: `연결 코드 ${pair.code}`,
        url: fullLink,
      });
      return;
    }
    await copyText(fullLink, 'link');
  };

  if (needsLogin) {
    return (
      <div className="space-y-3 py-8 text-center">
        <p className="text-sm text-[#828c94]">연결 코드를 발급하려면 로그인이 필요합니다.</p>
        <Link
          href="/parent/login?next=/parent/pair"
          className="inline-block rounded-xl bg-[#00B8CF] px-5 py-2.5 text-sm font-semibold text-white"
        >
          로그인하기
        </Link>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-3 py-8 text-center">
        <p className="text-sm text-[#828c94]">{loadError}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-xl border border-[#e5e8eb] px-4 py-2 text-sm text-[#191f28]"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (!pair) {
    return <p className="py-8 text-center text-sm text-[#828c94]">코드 발급 중…</p>;
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="space-y-4">
      <div className="ch-card p-6 text-center">
        <p className="text-sm font-semibold text-[#828c94]">연결 코드</p>
        <p
          className="mt-3 font-extrabold tracking-[0.35em] text-[#00b8cf]"
          style={{ fontSize: 42, lineHeight: 1, whiteSpace: 'nowrap' }}
        >
          {pair.code}
        </p>
        <p className="mt-4 text-xs text-[#adb5bd]">
          {mm}:{ss} 남음 · 1회용
        </p>
        <button
          type="button"
          onClick={() => copyText(pair.code, 'code')}
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#00b8cf]"
        >
          <Copy size={14} />
          {copied === 'code' ? '복사됨' : '코드 복사'}
        </button>
      </div>

      <div className="ch-card flex flex-col items-center p-4">
        <p className="mb-3 text-sm font-semibold text-[#2f3438]">QR 스캔 (추천)</p>
        {qrUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrUrl} alt="연결 QR" width={160} height={160} className="rounded-xl" />
        ) : null}
        <p className="mt-2 text-center text-xs text-[#828c94]">스캔 → 자녀 앱 연결</p>
      </div>

      <div className="ch-card space-y-2 p-4">
        <p className="text-sm font-semibold text-[#2f3438]">연결 링크</p>
        <p className="break-all text-xs text-[#828c94]">{fullLink}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => copyText(fullLink, 'link')}
            className="ch-btn-secondary flex flex-1 items-center justify-center gap-1 py-2.5 text-xs"
          >
            <Copy size={14} />
            {copied === 'link' ? '복사됨' : '링크 복사'}
          </button>
          <button
            type="button"
            onClick={() => void shareLink()}
            className="ch-btn-primary flex flex-1 items-center justify-center gap-1 py-2.5 text-xs"
          >
            <Share2 size={14} />
            공유
          </button>
        </div>
      </div>
    </div>
  );
}
