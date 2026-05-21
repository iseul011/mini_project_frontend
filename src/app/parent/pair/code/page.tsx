'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Share2, RefreshCw, Check } from 'lucide-react';
import { issuePairCode, type PairIssueResponse } from '@/lib/chungsora/clientApi';
import { deferEffect } from '@/lib/react/deferEffect';

export default function ParentPairCodePage() {
  const router = useRouter();
  const [childName, setChildName] = useState('자녀');
  const [pair, setPair] = useState<PairIssueResponse | null>(null);
  const [loadError, setLoadError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    deferEffect(() => {
      const name = sessionStorage.getItem('pair_child_nickname');
      if (name) setChildName(name);
    });
  }, []);

  const load = useCallback(async () => {
    setLoadError('');
    setLoading(true);
    try {
      const res = await issuePairCode();
      setPair(res);
      setSecondsLeft(res.ttl_seconds);
    } catch {
      setLoadError('코드를 불러오지 못했습니다. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    deferEffect(() => {
      void load();
    });
  }, [load]);

  // 카운트다운
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [pair?.code]);

  // 만료 시 자동 재발급
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
    ? `https://quickchart.io/qr?text=${encodeURIComponent(fullLink)}&size=240&margin=2`
    : '';

  const copyText = async (text: string, kind: 'code' | 'link') => {
    await navigator.clipboard.writeText(text);
    setCopied(kind);
    setTimeout(() => setCopied(null), 2000);
  };

  const shareLink = async () => {
    if (!fullLink || !pair) return;
    if (navigator.share) {
      await navigator.share({ title: '청소해라 연결', text: `연결 코드 ${pair.code}`, url: fullLink });
      return;
    }
    await copyText(fullLink, 'link');
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const urgency = secondsLeft > 0 && secondsLeft <= 30;

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-[#f7f9fa]">
      <header className="px-5 pb-3 pt-10">
        <button type="button" onClick={() => router.back()} className="text-[13px] font-semibold text-[#00b8cf]">
          &larr; 뒤로
        </button>
        <p className="mt-3 text-[13px] font-semibold text-[#00b8cf]">자녀 연결 · 2단계</p>
        <h1 className="mt-1 text-[26px] font-bold leading-tight tracking-[-0.5px] text-[#1a1e22]">
          {childName} 폰에서 연결
        </h1>
        <p className="mt-1.5 text-[14px] text-[#828c94]">
          QR · 링크 · 번호 중 아무 방법이나 사용하세요.
        </p>
      </header>

      {loadError ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5">
          <p className="text-[14px] text-[#828c94]">{loadError}</p>
          <button type="button" onClick={() => void load()} className="ch-btn-secondary px-6 py-3 text-sm">
            다시 시도
          </button>
        </div>
      ) : !pair ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#eaedef] border-t-[#00b8cf]" />
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-4 px-5 pb-8">

          {/* QR 코드 */}
          <div className="ch-card flex flex-col items-center gap-3 p-6">
            <p className="text-[13px] font-semibold text-[#828c94]">QR 스캔 (추천)</p>
            {qrUrl ? (
              <img src={qrUrl} alt="연결 QR" width={160} height={160} className="rounded-2xl" />
            ) : (
              <div className="flex h-40 w-40 items-center justify-center rounded-2xl bg-[#f0f2f4]">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#eaedef] border-t-[#00b8cf]" />
              </div>
            )}
            <p className="text-[12px] text-[#adb5bd]">스캔 → 앱 설치 + 자동 연결</p>
          </div>

          {/* 번호 코드 */}
          <div className="ch-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-[#828c94]">번호 코드</p>
              <span className={[
                'rounded-full px-2.5 py-0.5 text-[11px] font-bold tabular-nums',
                urgency ? 'bg-[#fff0f0] text-[#e03131]' : 'bg-[#f0f2f4] text-[#828c94]',
              ].join(' ')}>
                {mm}:{ss} 남음
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="font-extrabold tracking-[0.3em] text-[#1a1e22]"
                style={{ fontSize: 38, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                {pair.code}
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={() => void load()} disabled={loading} title="새로고침"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f0f2f4] text-[#828c94] transition-colors hover:bg-[#e5e8eb] disabled:opacity-50">
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
                <button type="button" onClick={() => void copyText(pair.code, 'code')} title="코드 복사"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e6f9fc] text-[#00b8cf] transition-colors hover:bg-[#d0f0f7]">
                  {copied === 'code' ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
            <p className="mt-2 text-[12px] text-[#adb5bd]">자녀 앱에서 이 코드를 입력하면 연결돼요.</p>
          </div>

          {/* 링크 공유 */}
          <div className="ch-card p-5">
            <p className="text-[13px] font-semibold text-[#828c94]">연결 링크</p>
            <p className="mt-2 break-all text-[12px] leading-relaxed text-[#adb5bd]">{fullLink}</p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => void copyText(fullLink, 'link')}
                className="ch-btn-secondary flex flex-1 items-center justify-center gap-1.5 py-3 text-[13px] font-semibold">
                {copied === 'link' ? <Check size={15} /> : <Copy size={15} />}
                {copied === 'link' ? '복사됨' : '링크 복사'}
              </button>
              <button type="button" onClick={() => void shareLink()}
                className="ch-btn-primary flex flex-1 items-center justify-center gap-1.5 py-3 text-[13px] font-bold">
                <Share2 size={15} />
                공유하기
              </button>
            </div>
          </div>

          {/* 완료 버튼 */}
          <div className="pt-2">
            <button type="button" onClick={() => router.push('/parent/pair/success')}
              className="ch-btn-primary w-full py-4 text-[16px] font-bold">
              연결됐어요 ✓
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
