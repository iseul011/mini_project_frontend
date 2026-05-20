'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { coachChat, scanRoom, verifyRoom } from '@/app/cleaning/api';
import { patchLogMeta, uploadLogPhoto } from '@/lib/chungsora/clientApi';
import { toLogDateParam } from '@/lib/chungsora/logV2';
import { useCleaningSessionStore, type QuestItem } from '@/lib/chungsora/cleaningSessionStore';

const SLOTS = ['입구', '바닥', '책상'] as const;

type CaptureMode = 'dirty' | 'after' | 'baseline';

type CaptureCoachBodyProps = {
  mode: CaptureMode;
  nextHref?: string;
  onComplete?: () => void;
};

function monstersToQuest(monsters: { name: string }[]): QuestItem[] {
  return monsters.slice(0, 5).map((m, i) => ({
    id: String(i + 1),
    label: m.name,
    done: false,
  }));
}

export function CaptureCoachBody({ mode, nextHref, onComplete }: CaptureCoachBodyProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [slotIdx, setSlotIdx] = useState(0);
  const [alignPct, setAlignPct] = useState(0);
  const [coachOn, setCoachOn] = useState(true);
  const [subtitle, setSubtitle] = useState('');
  const [processing, setProcessing] = useState(false);
  const [timer, setTimer] = useState(mode === 'dirty' || mode === 'baseline' ? 20 : 0);

  const setScanResult = useCleaningSessionStore((s) => s.setScanResult);
  const setVerifyResult = useCleaningSessionStore((s) => s.setVerifyResult);
  const setPhase = useCleaningSessionStore((s) => s.setPhase);
  const streakDays = useCleaningSessionStore((s) => s.streakDays);

  const todayKey = toLogDateParam(new Date());

  const persistPhoto = async (file: File, phase: 'before' | 'after' | 'baseline') => {
    try {
      await uploadLogPhoto(todayKey, phase, file);
    } catch {
      /* 로컬 플로우 계속 */
    }
  };

  const speak = useCallback((text: string) => {
    setSubtitle(text);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ko-KR';
      window.speechSynthesis.speak(u);
    }
  }, []);

  useEffect(() => {
    if (mode === 'baseline') {
      speak('깨끗한 방을 20초 영상으로 찍어주세요. 문에서 시작해 책상, 바닥 순으로 천천히.');
      const t = setInterval(() => setTimer((s) => (s > 0 ? s - 1 : 0)), 1000);
      return () => clearInterval(t);
    }
    if (mode !== 'dirty') return;
    speak(`${SLOTS[0]} 방향으로 카메라를 맞춰주세요. 20초 안에 촬영해요.`);
    const iv = setInterval(() => setAlignPct((p) => Math.min(98, p + 7)), 400);
    const t = setInterval(() => setTimer((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => {
      clearInterval(iv);
      clearInterval(t);
    };
  }, [mode, speak]);

  useEffect(() => {
    if (mode === 'after') {
      speak('청소 후 모습을 같은 각도로 촬영해주세요.');
    }
  }, [mode, speak]);

  const runScan = async (file?: File) => {
    setProcessing(true);
    setPhase(mode === 'dirty' ? 'scanning' : 'verifying');
    try {
      if (mode === 'baseline') {
        if (file) await persistPhoto(file, 'baseline');
        if (coachOn) speak('baseline 저장 완료! 이제 청소 시간을 설정해요.');
        if (nextHref) router.push(nextHref);
        else onComplete?.();
        return;
      }
      if (mode === 'dirty') {
        if (file) await persistPhoto(file, 'before');
        let items: QuestItem[];
        let pollution = 72;
        let summary = '방에 정리할 물건이 몇 가지 보여요.';
        if (file) {
          const res = await scanRoom(file, 'room-1', '지민 방');
          items = monstersToQuest(res.monsters);
          pollution = res.pollution_level;
          summary = res.summary;
        } else {
          items = [
            { id: '1', label: '바닥 옷 치우기', done: false },
            { id: '2', label: '책상 정리', done: false },
            { id: '3', label: '쓰레기 버리기', done: false },
          ];
        }
        setScanResult(items, pollution, summary);
        if (coachOn) speak('촬영 완료! 청소 리스트를 확인해볼까요?');
        if (nextHref) router.push(nextHref);
        else onComplete?.();
      } else {
        if (file) await persistPhoto(file, 'after');
        let cleanliness = 88;
        let comment = '정말 깨끗해졌어요!';
        if (file) {
          const res = await verifyRoom(file, 'room-1', '지민 방');
          cleanliness = res.cleanliness;
          comment = res.comment;
        }
        setVerifyResult(cleanliness, comment);
        try {
          await patchLogMeta(todayKey, { score: cleanliness, streak_days: streakDays });
        } catch {
          /* ignore */
        }
        if (coachOn) speak(`AI 점수 ${cleanliness}점! 잠금을 해제할게요.`);
        if (nextHref) router.push(nextHref);
        else onComplete?.();
      }
    } catch {
      if (mode === 'dirty') {
        setScanResult(
          [
            { id: '1', label: '바닥 옷 치우기', done: false },
            { id: '2', label: '책상 정리', done: false },
            { id: '3', label: '쓰레기 버리기', done: false },
          ],
          72,
          'AI 연결 전 · 데모 리스트',
        );
        if (nextHref) router.push(nextHref);
      } else {
        setVerifyResult(88, '데모 점수 · 정말 깨끗해요!');
        if (nextHref) router.push(nextHref);
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleCapture = () => {
    fileRef.current?.click();
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    void runScan(file);
  };

  const advanceSlot = () => {
    if (slotIdx < SLOTS.length - 1) {
      const next = slotIdx + 1;
      setSlotIdx(next);
      speak(`${SLOTS[next]} 방향으로 이동해주세요.`);
    } else {
      void runScan();
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[#2f3438] px-5 py-6 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">
          {mode === 'baseline' ? 'baseline 영상 20초' : mode === 'dirty' ? 'Before 촬영' : 'After 촬영'}
        </h1>
        <button
          type="button"
          onClick={() => setCoachOn((v) => !v)}
          className={`rounded-full px-3 py-1 text-xs font-bold ${coachOn ? 'bg-[#00b8cf] text-white' : 'bg-white/20'}`}
        >
          AI 코치 {coachOn ? 'ON' : 'OFF'}
        </button>
      </div>

      {(mode === 'dirty' || mode === 'baseline') && (
        <p className="mt-2 text-sm text-white/70">
          {mode === 'baseline' ? `남은 시간 ${timer}초 · 영상 권장 (실패 시 사진)` : `남은 시간 ${timer}초 · 정렬 ${alignPct}%`}
        </p>
      )}

      <div className="relative mt-4 flex flex-1 flex-col overflow-hidden rounded-2xl border border-dashed border-white/30">
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm text-white/50">
          카메라 프리뷰
        </div>
        <div className="absolute inset-4 rounded-xl border-2 border-[#00b8cf]/60" aria-hidden />
        <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-black/55 px-3 py-2 text-xs">
          {subtitle || '코치 자막이 여기 표시돼요'}
        </div>
        <div className="absolute left-3 top-3 rounded-full bg-black/50 px-2 py-1 text-[10px] font-bold">
          고스트 · {SLOTS[slotIdx]}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {SLOTS.map((s, i) => (
          <span
            key={s}
            className={`flex-1 rounded-lg py-2 text-center text-xs font-semibold ${
              i === slotIdx ? 'bg-[#00b8cf] text-white' : 'bg-white/10 text-white/60'
            }`}
          >
            {s}
          </span>
        ))}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept={mode === 'baseline' ? 'video/*,image/*' : 'image/*'}
        capture="environment"
        className="hidden"
        onChange={onFile}
      />

      <div className="mt-4 flex flex-col gap-2">
        <button type="button" onClick={handleCapture} disabled={processing} className="ch-btn-primary py-4 text-sm disabled:opacity-60">
          {processing ? '저장 중…' : mode === 'baseline' ? '영상·사진 촬영' : '사진 촬영'}
        </button>
        {mode !== 'baseline' && (
        <button type="button" onClick={advanceSlot} disabled={processing} className="rounded-xl border border-white/30 py-3 text-sm font-semibold text-white/90">
          {slotIdx < SLOTS.length - 1 ? '다음 슬롯' : mode === 'dirty' ? '촬영 완료 → AI scan' : '촬영 완료 → verify'}
        </button>
        )}
        {mode === 'baseline' && (
          <button
            type="button"
            onClick={() => {
              if (coachOn) speak('baseline 저장 완료!');
              if (nextHref) router.push(nextHref);
            }}
            disabled={processing}
            className="rounded-xl border border-white/30 py-3 text-sm font-semibold text-white/90"
          >
            촬영 완료 → 스케줄 설정
          </button>
        )}
        {coachOn && (
          <button
            type="button"
            onClick={() => {
              void coachChat('room-1', '지민 방', 72, ['바닥 옷'], [], '힌트 줘').then((r) => speak(r.reply)).catch(() => speak('책상 위부터 정리해볼까요?'));
            }}
            className="text-xs text-[#00b8cf]"
          >
            💬 코치에게 물어보기
          </button>
        )}
      </div>
    </div>
  );
}
