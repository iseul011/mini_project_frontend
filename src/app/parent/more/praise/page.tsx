'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { addPraisePreset, deletePraisePreset, fetchPraisePresets } from '@/lib/chungsora/clientApi';
import { DEFAULT_PRAISES, usePraiseStore } from '@/lib/chungsora/praiseStore';

export default function MorePraisePage() {
  const customPraises = usePraiseStore((s) => s.customPraises);
  const setCustomPraises = usePraiseStore((s) => s.setCustomPraises);
  const addPraise = usePraiseStore((s) => s.addPraise);
  const removePraise = usePraiseStore((s) => s.removePraise);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    fetchPraisePresets()
      .then((res) => {
        if (res.presets?.length) setCustomPraises(res.presets);
      })
      .catch(() => {/* persist fallback */});
  }, [setCustomPraises]);

  const handleRemove = async (phrase: string) => {
    removePraise(phrase);
    try {
      const res = await deletePraisePreset(phrase);
      setCustomPraises(res.presets);
    } catch {
      /* 로컬 fallback */
    }
  };

  const handleAdd = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    addPraise(trimmed);
    setDraft('');
    try {
      const res = await addPraisePreset(trimmed);
      setCustomPraises(res.presets);
    } catch {
      /* 로컬 fallback */
    }
  };

  return (
    <div className="px-5 py-6">
      <Link href="/parent/more" className="text-xs font-semibold text-[#00b8cf]">← 더보기</Link>
      <h1 className="mt-3 text-xl font-bold text-[#2f3438]">커스텀 칭찬</h1>
      <p className="mt-1 text-sm text-[#828c94]">로그 v2 · +칭찬 칩 · API 동기화</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {DEFAULT_PRAISES.map((p) => (
          <span key={p} className="rounded-full bg-[#f0f2f4] px-3 py-1.5 text-xs font-semibold">{p}</span>
        ))}
        {customPraises.map((p) => (
          <button key={p} type="button" onClick={() => void handleRemove(p)} className="rounded-full bg-[#e8f8fb] px-3 py-1.5 text-xs font-semibold text-[#00b8cf]">
            {p} ×
          </button>
        ))}
      </div>

      <div className="mt-6 flex gap-2">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="새 칭찬 문구" className="flex-1 rounded-xl border border-[#eaedef] px-4 py-3 text-sm outline-none" />
        <button type="button" onClick={handleAdd} className="ch-btn-primary px-4 text-sm">추가</button>
      </div>
    </div>
  );
}
