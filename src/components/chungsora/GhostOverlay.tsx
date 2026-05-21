'use client';

import { useEffect, useState } from 'react';
import { Ghost } from 'lucide-react';
import {
  GHOST_OPACITY,
  ghostSlotConfig,
  isGhostVideoUrl,
  type GhostSlotIndex,
} from '@/lib/chungsora/ghostSlots';
import { deferEffect } from '@/lib/react/deferEffect';

type GhostBaselineMediaProps = {
  url: string;
  onReady?: () => void;
  onError?: () => void;
};

/** 부모 baseline 키프레임 — 라이브 카메라 위 40% 반투명 겹침 */
export function GhostBaselineMedia({ url, onReady, onError }: GhostBaselineMediaProps) {
  const style = { opacity: GHOST_OPACITY };

  if (isGhostVideoUrl(url)) {
    return (
      <video
        src={url}
        muted
        playsInline
        autoPlay
        loop
        className="pointer-events-none absolute inset-0 z-[2] h-full w-full object-cover"
        style={style}
        onLoadedData={onReady}
        onError={onError}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      className="pointer-events-none absolute inset-0 z-[2] h-full w-full object-cover"
      style={style}
      onLoad={onReady}
      onError={onError}
    />
  );
}

/** 슬롯별 정렬 가이드선 (기획: 입구=문틀·바닥선, 바닥=바닥면, 책상=책상선) */
export function GhostSlotGuide({ slotIdx }: { slotIdx: GhostSlotIndex }) {
  const line = 'absolute bg-[#00b8cf]';
  const accent = 'absolute bg-[#f04452]';

  if (slotIdx === 0) {
    return (
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-[10%_14%_22%_14%] rounded-lg border-2 border-dashed border-[#00b8cf]/90" />
        <div className={`${line} left-[14%] right-[14%] top-[78%] h-[3px] opacity-90`} />
        <div className="absolute left-[14%] top-[10%] h-10 w-10 border-l-[3px] border-t-[3px] border-[#00b8cf]" />
        <div className="absolute right-[14%] top-[10%] h-10 w-10 border-r-[3px] border-t-[3px] border-[#00b8cf]" />
        <div className="absolute bottom-[22%] left-[14%] h-10 w-10 border-b-[3px] border-l-[3px] border-[#00b8cf]" />
        <div className="absolute bottom-[22%] right-[14%] h-10 w-10 border-b-[3px] border-r-[3px] border-[#00b8cf]" />
      </div>
    );
  }

  if (slotIdx === 1) {
    return (
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-x-0 top-0 h-[28%] bg-gradient-to-b from-black/50 to-transparent" />
        <p className="absolute left-1/2 top-3 -translate-x-1/2 text-[10px] font-medium text-white/50">
          천장 무시
        </p>
        <div className="absolute inset-x-[8%] bottom-[6%] top-[30%] rounded-xl border-2 border-dashed border-[#00b8cf]/85 bg-[#00b8cf]/8" />
        <div className={`${line} left-[8%] right-[8%] top-[30%] h-[2px] opacity-80`} />
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div className={`${accent} left-[12%] right-[12%] top-[42%] h-[3px] opacity-95`} />
      <div className={`${line} left-[12%] right-[12%] top-[26%] h-px opacity-55`} />
      <div className={`${line} left-[18%] top-[26%] bottom-[28%] w-px opacity-70`} />
      <div className={`${line} right-[18%] top-[26%] bottom-[28%] w-px opacity-70`} />
      <p className="absolute bottom-[22%] left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-[10px] font-semibold text-[#ffc9c9]">
        책상선 맞추기
      </p>
    </div>
  );
}

type GhostAlignmentBarProps = {
  slotIdx: GhostSlotIndex;
  aligned: boolean;
  onAlignedChange: (aligned: boolean) => void;
  showGhost: boolean;
};

export function GhostAlignmentBar({ slotIdx, aligned, onAlignedChange, showGhost }: GhostAlignmentBarProps) {
  const cfg = ghostSlotConfig(slotIdx);
  if (!showGhost) return null;

  return (
    <div className="absolute right-3 top-12 flex flex-col items-end gap-2">
      <div className="flex gap-1 rounded-full bg-black/65 p-0.5 text-[10px] font-bold">
        <button
          type="button"
          onClick={() => onAlignedChange(false)}
          className={`rounded-full px-2.5 py-1 ${!aligned ? 'bg-[#00b8cf] text-white' : 'text-white/55'}`}
        >
          안 맞음
        </button>
        <button
          type="button"
          onClick={() => onAlignedChange(true)}
          className={`rounded-full px-2.5 py-1 ${aligned ? 'bg-[#00c73c] text-white' : 'text-white/55'}`}
        >
          맞음
        </button>
      </div>
      {!aligned && (
        <span className="rounded-lg border border-[#f59e0b]/80 bg-[#f59e0b]/20 px-2.5 py-1 text-[10px] font-semibold text-[#ffd8a8]">
          {cfg.misalignBadge}
        </span>
      )}
    </div>
  );
}

export function GhostSlotBadge({ slotIdx, showGhost }: { slotIdx: GhostSlotIndex; showGhost: boolean }) {
  const cfg = ghostSlotConfig(slotIdx);
  return (
    <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-1 text-[10px] font-bold text-[#00b8cf]">
      {showGhost && <Ghost className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />}
      <span>{cfg.label}</span>
      {showGhost && <span className="text-white/45">· 고스트</span>}
    </div>
  );
}

export function GhostBottomCue({ slotIdx, showGhost }: { slotIdx: GhostSlotIndex; showGhost: boolean }) {
  if (!showGhost) return null;
  const cfg = ghostSlotConfig(slotIdx);
  return (
    <p className="absolute bottom-14 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#f04452]/85 px-3 py-1 text-[10px] font-bold text-white">
      {cfg.bottomCue}
    </p>
  );
}

export function GhostBaselineUnavailable() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/70 px-6 text-center">
      <p className="text-sm leading-relaxed text-white/80">
        부모 baseline 사진을 불러오지 못했어요.
        <br />
        <span className="text-xs text-white/55">부모가 3곳 촬영·AI 평가를 완료했는지, 서버 파일이 있는지 확인해 주세요.</span>
      </p>
    </div>
  );
}

export function GhostBaselineMissingHint() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 text-center">
      <p className="text-sm text-white/70">
        이 슬롯 baseline이 없어요.
        <br />
        <span className="text-xs text-white/45">부모 baseline 3곳 등록 후 고스트가 표시됩니다.</span>
      </p>
    </div>
  );
}

/** baseline URL fetch 가능 여부 (BFF·404 확인, 오버레이 표시와 분리) */
export function useGhostMediaStatus(url: string | null | undefined) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  useEffect(() => {
    if (!url) {
      deferEffect(() => setStatus('idle'));
      return;
    }

    let cancelled = false;
    deferEffect(() => {
      if (!cancelled) setStatus('loading');
    });

    const probe = async () => {
      try {
        const res = await fetch(url, { method: 'GET', credentials: 'include', cache: 'no-store' });
        if (!cancelled) setStatus(res.ok ? 'ready' : 'error');
      } catch {
        if (!cancelled) setStatus('error');
      }
    };

    void probe();
    return () => {
      cancelled = true;
    };
  }, [url]);

  return { status };
}
