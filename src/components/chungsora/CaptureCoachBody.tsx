'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { coachChat } from '@/app/cleaning/api';
import { resolveLogPhotoUrl } from '@/lib/api/resolveLogPhotoUrl';
import { fetchFamilySummary, patchLogMeta, uploadLogPhoto } from '@/lib/chungsora/clientApi';
import {
  SLOT_COUNT,
  compareAllSlotsWithBaseline,
  evaluateAllBaselineSlots,
  scanAllSlotCaptures,
} from '@/lib/chungsora/captureSlots';
import { pickRecorderMime } from '@/lib/chungsora/captureVideo';
import { toLogDateParam } from '@/lib/chungsora/logV2';
import { useCleaningSessionStore, type QuestItem } from '@/lib/chungsora/cleaningSessionStore';
import { AiModelAlert } from '@/components/chungsora/AiModelAlert';
import { AI_MODEL_ALERT_DEFAULT, isAiModelError } from '@/lib/chungsora/modelAlert';

const SLOTS = ['입구', '바닥', '책상'] as const;
const CAPTURE_SEC = 20;

type CaptureMode = 'dirty' | 'after' | 'baseline';
type CaptureKind = 'video' | 'photo';

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

function GhostGuideLines() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div className="absolute inset-4 rounded-xl border-2 border-dashed border-[#00b8cf]/90" />
      <div className="absolute left-1/3 top-4 bottom-4 w-px bg-[#00b8cf]/55" />
      <div className="absolute left-2/3 top-4 bottom-4 w-px bg-[#00b8cf]/55" />
      <div className="absolute top-1/3 left-4 right-4 h-px bg-[#00b8cf]/55" />
      <div className="absolute top-2/3 left-4 right-4 h-px bg-[#00b8cf]/55" />
      <div className="absolute left-4 top-4 h-8 w-8 border-l-[3px] border-t-[3px] border-[#00b8cf]" />
      <div className="absolute right-4 top-4 h-8 w-8 border-r-[3px] border-t-[3px] border-[#00b8cf]" />
      <div className="absolute bottom-4 left-4 h-8 w-8 border-b-[3px] border-l-[3px] border-[#00b8cf]" />
      <div className="absolute bottom-4 right-4 h-8 w-8 border-b-[3px] border-r-[3px] border-[#00b8cf]" />
      <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#00b8cf]/70" />
    </div>
  );
}

function GhostOverlay({ url }: { url: string }) {
  const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(url);
  if (isVideo) {
    return (
      <video
        src={url}
        muted
        playsInline
        autoPlay
        loop
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-screen"
    />
  );
}

function emptySlots(): (File | null)[] {
  return Array.from({ length: SLOT_COUNT }, () => null);
}

export function CaptureCoachBody({ mode, nextHref, onComplete }: CaptureCoachBodyProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [slotIdx, setSlotIdx] = useState(0);
  const [slotCaptures, setSlotCaptures] = useState<(File | null)[]>(emptySlots);
  const [baselineUrls, setBaselineUrls] = useState<(string | null)[]>([null, null, null]);
  const [captureKind, setCaptureKind] = useState<CaptureKind>('video');
  const [coachOn, setCoachOn] = useState(true);
  const [subtitle, setSubtitle] = useState('');
  const [error, setError] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [recording, setRecording] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [timer, setTimer] = useState(CAPTURE_SEC);

  const setScanResult = useCleaningSessionStore((s) => s.setScanResult);
  const setVerifyResult = useCleaningSessionStore((s) => s.setVerifyResult);
  const setPhase = useCleaningSessionStore((s) => s.setPhase);
  const streakDays = useCleaningSessionStore((s) => s.streakDays);

  const todayKey = toLogDateParam(new Date());
  const ghostUrl = mode !== 'baseline' ? baselineUrls[slotIdx] : null;
  const showGhost = !!ghostUrl;
  const slotsDone = slotCaptures.filter(Boolean).length;
  const allSlotsDone = slotsDone === SLOT_COUNT;

  const speak = useCallback((text: string) => {
    setSubtitle(text);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ko-KR';
      window.speechSynthesis.speak(u);
    }
  }, []);

  const showFailure = useCallback(
    (msg: string) => {
      setError(msg);
      if (isAiModelError(msg)) {
        setAlertMessage(msg.trim() || AI_MODEL_ALERT_DEFAULT);
        setAlertOpen(true);
      }
      speak(msg);
    },
    [speak],
  );

  useEffect(() => {
    void fetchFamilySummary()
      .then((s) => {
        const urls = (s.baseline_urls?.length ? s.baseline_urls : s.baseline_url ? [s.baseline_url] : [])
          .map((u) => resolveLogPhotoUrl(u))
          .filter(Boolean) as string[];
        const padded: (string | null)[] = [null, null, null];
        urls.forEach((u, i) => {
          padded[i] = u;
        });
        setBaselineUrls(padded);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (captureKind !== 'video') return;
    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const el = videoRef.current;
        if (el) {
          el.srcObject = stream;
          await el.play();
          setCameraReady(true);
          setCameraError('');
        }
      } catch {
        if (!cancelled) {
          setCameraError('카메라를 켤 수 없어요. 사진 3장 모드로 전환해 주세요.');
          setCaptureKind('photo');
        }
      }
    }

    void startCamera();
    return () => {
      cancelled = true;
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
      recorderRef.current?.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [captureKind]);

  useEffect(() => {
    const intro =
      mode === 'baseline'
        ? '입구·바닥·책상 3곳 baseline 영상을 찍어요. Gemini AI가 학습 가능한지 평가합니다.'
        : mode === 'dirty'
          ? `${SLOTS[0]}부터 촬영해요. 고스트 라인에 맞추고 3곳 모두 필요합니다.`
          : `부모 baseline과 비교합니다. ${SLOTS[0]}부터 3곳 모두 촬영해 주세요.`;
    const t = setTimeout(() => speak(intro), 0);
    return () => clearTimeout(t);
  }, [mode, speak]);

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setTimer((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [recording]);

  const persistCapture = async (
    file: File,
    phase: 'before' | 'after' | 'baseline',
    slot: number,
  ) => {
    try {
      await uploadLogPhoto(todayKey, phase, file, slot);
    } catch {
      /* 업로드 실패해도 AI 평가는 계속 */
    }
  };

  const finalizeAllSlots = async (captures: File[]) => {
    setError('');
    setProcessing(true);

    try {
      if (mode === 'baseline') {
        setPhase('scanning');
        await evaluateAllBaselineSlots(captures, SLOTS);
        if (coachOn) speak('baseline 3곳 AI 합격! 이제 청소 시간을 설정해요.');
        if (nextHref) router.push(nextHref);
        else onComplete?.();
        return;
      }

      if (mode === 'dirty') {
        setPhase('scanning');
        const res = await scanAllSlotCaptures(captures, SLOTS);
        setScanResult(monstersToQuest(res.monsters), res.pollution, res.summary);
        if (coachOn) speak('3곳 스캔 완료! 청소 리스트를 확인해요.');
        if (nextHref) router.push(nextHref);
        else onComplete?.();
        return;
      }

      setPhase('verifying');
      const urls = baselineUrls.filter(Boolean) as string[];
      const res = await compareAllSlotsWithBaseline(captures, urls, SLOTS);
      setVerifyResult(res.cleanliness, res.comment);
      await patchLogMeta(todayKey, { score: res.cleanliness, streak_days: streakDays });
      if (coachOn) speak(`Gemini baseline 비교 ${res.cleanliness}점!`);
      if (nextHref) router.push(nextHref);
      else onComplete?.();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'AI 평가에 실패했습니다.';
      showFailure(msg);
    } finally {
      setProcessing(false);
      setRecording(false);
      setTimer(CAPTURE_SEC);
    }
  };

  const onSlotCaptured = async (file: File, index: number) => {
    setError('');
    setProcessing(true);
    try {
      const phase = mode === 'dirty' ? 'before' : mode === 'after' ? 'after' : 'baseline';
      await persistCapture(file, phase, index);

      const nextCaptures = [...slotCaptures];
      nextCaptures[index] = file;
      setSlotCaptures(nextCaptures);

      if (index < SLOT_COUNT - 1) {
        const next = index + 1;
        setSlotIdx(next);
        speak(`${SLOTS[next]} ${captureKind === 'video' ? '영상' : '사진'}을 이어서 찍어 주세요.`);
        return;
      }

      await finalizeAllSlots(nextCaptures as File[]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '저장에 실패했습니다.';
      showFailure(msg);
    } finally {
      setProcessing(false);
      setRecording(false);
      setTimer(CAPTURE_SEC);
    }
  };

  const finishRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;
    recorder.stop();
  }, []);

  const startRecording = () => {
    const stream = streamRef.current;
    if (!stream || recording || processing || slotCaptures[slotIdx]) return;

    const mime = pickRecorderMime();
    chunksRef.current = [];
    const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const type = recorder.mimeType || 'video/webm';
      const blob = new Blob(chunksRef.current, { type });
      const ext = type.includes('mp4') ? 'mp4' : 'webm';
      const file = new File([blob], `${SLOTS[slotIdx]}.${ext}`, { type });
      void onSlotCaptured(file, slotIdx);
    };
    recorder.start(1000);
    recorderRef.current = recorder;
    setRecording(true);
    setTimer(CAPTURE_SEC);
    speak(`${SLOTS[slotIdx]} 영상 촬영 시작. 고스트 라인에 맞춰 주세요.`);

    stopTimerRef.current = setTimeout(finishRecording, CAPTURE_SEC * 1000);
  };

  const onPhotoPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || slotCaptures[slotIdx]) return;
    void onSlotCaptured(file, slotIdx);
    e.target.value = '';
  };

  const captureLabel = processing
    ? allSlotsDone
      ? 'Gemini AI 평가 중…'
      : '저장 중…'
    : recording
      ? `${SLOTS[slotIdx]} ${timer}초`
      : slotCaptures[slotIdx]
        ? `${SLOTS[slotIdx]} 완료 ✓`
        : captureKind === 'video'
          ? `${SLOTS[slotIdx]} 영상 촬영`
          : `${SLOTS[slotIdx]} 사진 촬영`;

  return (
    <div className="flex min-h-dvh flex-col bg-[#2f3438] px-5 py-6 text-white">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-bold">
          {mode === 'baseline'
            ? 'baseline 3곳 + AI'
            : mode === 'dirty'
              ? 'Before · 3곳'
              : 'After · baseline 비교'}
        </h1>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setCoachOn((v) => !v)}
            className={`rounded-full px-2 py-1 text-[10px] font-bold ${coachOn ? 'bg-[#00b8cf] text-white' : 'bg-white/15'}`}
          >
            코치
          </button>
          <button
            type="button"
            onClick={() => setCaptureKind('video')}
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${captureKind === 'video' ? 'bg-[#00b8cf] text-white' : 'bg-white/15'}`}
          >
            영상
          </button>
          <button
            type="button"
            onClick={() => setCaptureKind('photo')}
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${captureKind === 'photo' ? 'bg-[#00b8cf] text-white' : 'bg-white/15'}`}
          >
            사진3장
          </button>
        </div>
      </div>

      <p className="mt-2 text-sm text-white/70">
        {slotsDone}/{SLOT_COUNT}곳 · {captureKind === 'video' ? '20초 영상' : '사진 1장'} × 3
        {mode === 'after' && !baselineUrls[0] && ' · ⚠ 부모 baseline 미등록'}
      </p>

      {error && (
        <p className="mt-2 rounded-lg bg-[#f04452]/20 px-3 py-2 text-xs text-[#ffc9c9]">{error}</p>
      )}

      <div className="relative mt-4 flex min-h-[52dvh] flex-1 flex-col overflow-hidden rounded-2xl border-2 border-[#00b8cf]/50 bg-black">
        {captureKind === 'video' && (
          <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full object-cover" />
        )}
        {captureKind === 'photo' && !slotCaptures[slotIdx] && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm text-white/60">
            {SLOTS[slotIdx]} 사진을 촬영해 주세요
          </div>
        )}
        {captureKind === 'video' && !cameraReady && !cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm text-white/60">
            카메라 준비 중…
          </div>
        )}
        {showGhost && ghostUrl && (
          <>
            <GhostOverlay url={ghostUrl} />
            <GhostGuideLines />
          </>
        )}
        {!showGhost && mode !== 'baseline' && <GhostGuideLines />}
        {recording && (
          <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-[#f04452] px-2.5 py-1 text-[10px] font-bold">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            REC
          </div>
        )}
        <div className="absolute left-3 top-3 rounded-full bg-black/60 px-2 py-1 text-[10px] font-bold text-[#00b8cf]">
          {showGhost ? `👻 ${SLOTS[slotIdx]}` : SLOTS[slotIdx]}
        </div>
        <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-black/55 px-3 py-2 text-xs">
          {subtitle || '코치 자막'}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {SLOTS.map((s, i) => {
          const done = !!slotCaptures[i];
          const active = i === slotIdx && !done;
          return (
            <span
              key={s}
              className={`flex-1 rounded-lg py-2 text-center text-xs font-semibold ${
                done ? 'bg-[#00c73c] text-white' : active ? 'bg-[#00b8cf] text-white' : 'bg-white/10 text-white/60'
              }`}
            >
              {done ? '✓ ' : ''}
              {s}
            </span>
          );
        })}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept={captureKind === 'video' ? 'video/*,image/*' : 'image/*'}
        capture="environment"
        className="hidden"
        onChange={onPhotoPick}
      />

      <div className="mt-4 flex flex-col gap-2">
        {captureKind === 'video' ? (
          <button
            type="button"
            onClick={recording ? finishRecording : startRecording}
            disabled={processing || !!slotCaptures[slotIdx] || (!cameraReady && !cameraError)}
            className="ch-btn-primary py-4 text-sm disabled:opacity-60"
          >
            {captureLabel}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={processing || !!slotCaptures[slotIdx]}
            className="ch-btn-primary py-4 text-sm disabled:opacity-60"
          >
            {captureLabel}
          </button>
        )}
        {cameraError && captureKind === 'video' && (
          <button
            type="button"
            onClick={() => setCaptureKind('photo')}
            className="rounded-xl border border-[#00b8cf]/50 py-3 text-sm font-semibold text-[#00b8cf]"
          >
            사진 3장 모드로 전환
          </button>
        )}
        {coachOn && !processing && (
          <button
            type="button"
            onClick={() => {
              void coachChat('room-1', '지민 방', 72, ['바닥 옷'], [], '힌트 줘')
                .then((r) => speak(r.reply))
                .catch(() => speak('책상 위부터 정리해볼까요?'));
            }}
            className="text-xs text-[#00b8cf]"
          >
            💬 코치에게 물어보기
          </button>
        )}
      </div>

      <AiModelAlert
        open={alertOpen}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />
    </div>
  );
}
