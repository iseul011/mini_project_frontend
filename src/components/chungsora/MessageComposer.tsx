'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { PRAISE_EMOJI } from '@/lib/chungsora/logV2';
import { addPraisePreset, fetchPraisePresets } from '@/lib/chungsora/clientApi';
import { usePraiseStore } from '@/lib/chungsora/praiseStore';
import { deferEffect } from '@/lib/react/deferEffect';
import type { ChungsoraRole } from '@/lib/chungsora/role';

export type ChatEntry = {
  id: string;
  role: 'child' | 'parent';
  text: string;
  badge?: string;
  time?: string;
  at?: string;
};

type PraiseFloatingPanelProps = {
  viewer: ChungsoraRole;
  onEmoji: (emoji: string) => void;
  onPraiseChip: (chip: string, asBadgeOnly?: boolean) => void;
};

export function PraiseFloatingPanel({ viewer, onEmoji, onPraiseChip }: PraiseFloatingPanelProps) {
  const customPraises = usePraiseStore((s) => s.customPraises);
  const setCustomPraises = usePraiseStore((s) => s.setCustomPraises);
  const [addingCustom, setAddingCustom] = useState(false);
  const [customDraft, setCustomDraft] = useState('');

  useEffect(() => {
    deferEffect(() => {
      void fetchPraisePresets()
        .then((res) => setCustomPraises(res.presets ?? []))
        .catch(() => setCustomPraises([]));
    });
  }, [setCustomPraises]);

  return (
    <div className="mx-2.5 mb-2 rounded-2xl bg-[rgba(40,40,40,0.88)] px-3.5 py-3 backdrop-blur-sm">
      <div className="grid grid-cols-6 gap-1 text-center text-[22px] leading-none">
        {PRAISE_EMOJI.map((e) => (
          <button
            key={e}
            type="button"
            onMouseDown={(ev) => ev.preventDefault()}
            onClick={() => onEmoji(e)}
            className="rounded-lg py-1 active:bg-white/10"
          >
            {e}
          </button>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {customPraises.map((chip) => (
            <button
              key={chip}
              type="button"
              onMouseDown={(ev) => ev.preventDefault()}
              onClick={() => onPraiseChip(chip, true)}
              className="rounded-full border border-[#00B8CF] bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-[#7ee8f7]"
            >
              {chip}
            </button>
          ))}
        {viewer === 'parent' && customPraises.length === 0 && (
          <span className="px-1 text-[10px] text-white/50">칭찬 프리셋을 불러오는 중…</span>
        )}
        {viewer === 'parent' && (
          <button
            type="button"
            onMouseDown={(ev) => ev.preventDefault()}
            onClick={() => setAddingCustom((v) => !v)}
            className="flex items-center gap-0.5 rounded-full border border-dashed border-white/35 px-2.5 py-1 text-[11px] font-semibold text-white/70"
          >
            <Plus size={12} /> 칭찬
          </button>
        )}
      </div>
      {addingCustom && viewer === 'parent' && (
        <div className="mt-2 flex gap-2">
          <input
            value={customDraft}
            onChange={(e) => setCustomDraft(e.target.value)}
            placeholder="나만의 칭찬"
            className="min-w-0 flex-1 rounded-full border-0 bg-white/15 px-3 py-1.5 text-xs text-white outline-none placeholder:text-white/45"
          />
          <button
            type="button"
            onClick={() => {
              const trimmed = customDraft.trim();
              if (!trimmed) return;
              onPraiseChip(trimmed, true);
              setCustomDraft('');
              setAddingCustom(false);
              void addPraisePreset(trimmed)
                .then((res) => setCustomPraises(res.presets ?? []))
                .catch(() => undefined);
            }}
            className="rounded-full bg-[#00B8CF] px-3 py-1.5 text-xs font-bold text-white"
          >
            저장
          </button>
        </div>
      )}
    </div>
  );
}

type MessageComposerProps = {
  viewer: ChungsoraRole;
  onSend?: (text: string, badge?: string) => void;
};

export function MessageComposer({ viewer, onSend }: MessageComposerProps) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState('');
  const [pendingBadge, setPendingBadge] = useState<string | undefined>();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focused) inputRef.current?.focus();
  }, [focused]);

  const send = (text: string, badge?: string) => {
    const trimmed = text.trim();
    if (!trimmed && !badge) return;
    onSend?.(trimmed || badge || '', badge);
    setDraft('');
    setPendingBadge(undefined);
    setFocused(false);
  };

  const appendEmoji = (emoji: string) => {
    setDraft((d) => `${d}${emoji}`);
    inputRef.current?.focus();
  };

  const handlePraiseChip = (chip: string, asBadgeOnly?: boolean) => {
    if (asBadgeOnly && !draft.trim()) {
      send(chip, chip);
      return;
    }
    setPendingBadge(chip);
    setDraft((d) => d || chip);
    inputRef.current?.focus();
  };

  return (
    <div
      className={`shrink-0 border-t ${focused ? 'border-transparent bg-[rgba(18,18,18,0.95)]' : 'border-[#eaedef] bg-white'}`}
    >
      {focused && (
        <PraiseFloatingPanel viewer={viewer} onEmoji={appendEmoji} onPraiseChip={handlePraiseChip} />
      )}

      <div className={`flex items-center gap-2 px-3 ${focused ? 'pb-2 pt-1' : 'py-2.5'} safe-bottom`}>
        {focused ? (
          <>
            <button
              type="button"
              onClick={() => {
                setFocused(false);
                setPendingBadge(undefined);
              }}
              className="shrink-0 px-2 py-1 text-xs font-semibold text-white/70"
            >
              닫기
            </button>
            <div className="flex min-w-0 flex-1 items-center rounded-full border border-white/85 px-1 py-0.5">
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') send(draft, pendingBadge);
                }}
                placeholder="메시지 입력…"
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-white/40"
              />
            </div>
            <button
              type="button"
              onClick={() => send(draft, pendingBadge)}
              disabled={!draft.trim() && !pendingBadge}
              className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                draft.trim() || pendingBadge ? 'bg-[#00B8CF]' : 'bg-white/20'
              }`}
            >
              ↑
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setFocused(true)}
            className="flex w-full items-center rounded-full border border-[#eaedef] bg-[#f7f9fa] px-4 py-2.5 text-left text-sm text-[#adb5bd]"
          >
            메시지 입력…
          </button>
        )}
      </div>

      {focused && (
        <div className="border-t border-white/10 bg-[#1c1c1e] px-4 py-2 text-center text-[10px] text-white/40">
          한글 키보드 · 닫기는 입력창 위
        </div>
      )}
    </div>
  );
}

export function ChatBubble({ entry }: { entry: ChatEntry }) {
  const isParent = entry.role === 'parent';
  const label = isParent ? '엄마' : '지민';

  return (
    <div className={`flex max-w-[88%] flex-col gap-1 ${isParent ? 'ml-auto items-end' : 'items-start'}`}>
      {entry.badge && isParent && (
        <span className="rounded-full bg-[#00B8CF] px-2.5 py-1 text-[11px] font-bold text-white">
          {entry.badge}
        </span>
      )}
      <div
        className={`rounded-xl border border-[#eaedef] bg-white px-3 py-2.5 text-sm text-[#2f3438] ${
          isParent ? 'rounded-tr-sm' : 'rounded-tl-sm'
        }`}
      >
        {entry.text}
      </div>
      {entry.time && (
        <span className="text-[10px] text-[#828c94]">
          {label} · {entry.time}
        </span>
      )}
    </div>
  );
}
