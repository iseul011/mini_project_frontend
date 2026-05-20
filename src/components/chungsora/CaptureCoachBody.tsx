'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { coachChat } from '@/app/cleaning/api';
import { fetchFamilySummary, patchLogMeta, uploadLogPhoto, updateFamilyProfile } from '@/lib/chungsora/clientApi';
import {
  SLOT_COUNT,
  compareAllSlotsWithBaseline,
  evaluateAllBaselineSlots,
  scanAllSlotCaptures,
} from '@/lib/chungsora/captureSlots';
import { padBaselineUrls, baselineSlotsReady } from '@/lib/chungsora/baselineUrls';
import { pickRecorderMime } from '@/lib/chungsora/captureVideo';
import { toLogDateParam } from '@/lib/chungsora/logV2';
import { useCleaningSessionStore, type QuestItem } from '@/lib/chungsora/cleaningSessionStore';
import { AiModelAlert } from '@/components/chungsora/AiModelAlert';
import { CoachSubtitle } from '@/components/chungsora/CoachSubtitle';
import {
  GhostAlignmentBar,
  GhostBaselineMedia,
  GhostBaselineMissingHint,
  GhostBaselineUnavailable,
  GhostBottomCue,
  GhostSlotBadge,
  GhostSlotGuide,
} from '@/components/chungsora/GhostOverlay';
import { AI_MODEL_ALERT_DEFAULT, isAiModelError } from '@/lib/chungsora/modelAlert';
import {
  afterCompareSpeech,
  baselinePassSpeech,
  captureModeIntro,
  coachHintFallback,
  coachPausedSpeech,
  coachResumedSpeech,
  dirtyScanDoneSpeech,
  recordingCountdownSpeech,
  recordingStartSpeech,
  slotBaselineMissing,
  slotAlignSpeech,
  slotTransitionSpeech,
  subtitlePlaceholder,
} from '@/lib/chungsora/coachCopy';
import { ghostSlotConfig, type GhostSlotIndex } from '@/lib/chungsora/ghostSlots';
import { useCoachSpeech } from '@/lib/chungsora/useCoachSpeech';

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
  const countdownSpokenRef = useRef<Set<number>>(new Set());
  const ghostReadySpokenRef = useRef<Set<number>>(new Set());

  const [slotIdx, setSlotIdx] = useState(0);
  const [slotCaptures, setSlotCaptures] = useState<(File | null)[]>(emptySlots);
  const [baselineUrls, setBaselineUrls] = useState<(string | null)[]>([null, null, null]);
  const [captureKind, setCaptureKind] = useState<CaptureKind>('video');
  const [coachOn, setCoachOn] = useState(true);
  const [error, setError] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [recording, setRecording] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [timer, setTimer] = useState(CAPTURE_SEC);
  const [ghostAligned, setGhostAligned] = useState(false);
  const [ghostMediaFailed, setGhostMediaFailed] = useState(false);

  const setScanResult = useCleaningSessionStore((s) => s.setScanResult);
  const setVerifyResult = useCleaningSessionStore((s) => s.setVerifyResult);
  const setPhase = useCleaningSessionStore((s) => s.setPhase);
  const streakDays = useCleaningSessionStore((s) => s.streakDays);

  const todayKey = toLogDateParam(new Date());
  const ghostUrl = mode !== 'baseline' ? baselineUrls[slotIdx] : null;
  const ghostSlot = slotIdx as GhostSlotIndex;
  const showGhostMedia = mode !== 'baseline' && !!ghostUrl && !ghostMediaFailed;
  const ghostMediaBroken = mode !== 'baseline' && !!ghostUrl && ghostMediaFailed;

  useEffect(() => {
    setGhostMediaFailed(false);
  }, [ghostUrl]);
  const ghostMediaMissing = mode !== 'baseline' && !ghostUrl;
  const slotsDone = slotCaptures.filter(Boolean).length;
  const allSlotsDone = slotsDone === SLOT_COUNT;
  const photoFallbackOnly = !!cameraError;

  const loadBaselineUrls = useCallback(async () => {
    const s = await fetchFamilySummary();
    const padded = padBaselineUrls(s.baseline_urls, s.baseline_url);
    setBaselineUrls(padded);
    return { summary: s, urls: padded };
  }, []);

  const resetCaptures = useCallback(() => {
    setSlotCaptures(emptySlots());
    setSlotIdx(0);
  }, []);

  const { subtitle, speak, showSubtitle, stop: stopCoach } = useCoachSpeech(coachOn);

  const showFailure = useCallback(
    (msg: string) => {
      setError(msg);
      if (isAiModelError(msg)) {
        setAlertMessage(msg.trim() || AI_MODEL_ALERT_DEFAULT);
        setAlertOpen(true);
      }
      speak(msg, { force: true });
    },
    [speak],
  );

  const toggleCoach = useCallback(() => {
    setCoachOn((prev) => {
      const next = !prev;
      if (!next) {
        stopCoach();
        showSubtitle(coachPausedSpeech());
      } else {
        speak(coachResumedSpeech());
      }
      return next;
    });
  }, [speak, showSubtitle, stopCoach]);

  useEffect(() => {
    void loadBaselineUrls().catch(() => undefined);
  }, [loadBaselineUrls]);

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
    ghostReadySpokenRef.current.clear();
    countdownSpokenRef.current.clear();
    const intro = captureModeIntro(mode);
    const t = setTimeout(() => {
      if (coachOn) speak(intro);
      else showSubtitle(intro);
    }, 0);
    return () => clearTimeout(t);
  }, [mode, coachOn, speak, showSubtitle]);

  const goToSlot = useCallback(
    (index: number) => {
      setGhostAligned(false);
      setSlotIdx(index);
      ghostReadySpokenRef.current.add(index);
      if (mode === 'baseline' || !coachOn) return;
      if (!baselineUrls[index]) {
        speak(slotBaselineMissing(index));
        return;
      }
      speak(slotAlignSpeech(index));
    },
    [mode, coachOn, baselineUrls, speak],
  );

  /** 고스트 URL 준비 후 1회 안내 (슬롯 탭으로 이미 말한 경우 제외) */
  useEffect(() => {
    if (mode === 'baseline' || !coachOn || !ghostUrl || ghostMediaFailed) return;
    if (ghostReadySpokenRef.current.has(slotIdx)) return;
    ghostReadySpokenRef.current.add(slotIdx);
    speak(slotAlignSpeech(slotIdx));
  }, [mode, coachOn, ghostUrl, ghostMediaFailed, slotIdx, speak]);

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setTimer((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [recording]);

  useEffect(() => {
    if (!recording) {
      countdownSpokenRef.current.clear();
      return;
    }
    if (!coachOn) return;
    const line = recordingCountdownSpeech(timer);
    if (!line || countdownSpokenRef.current.has(timer)) return;
    countdownSpokenRef.current.add(timer);
    speak(line);
  }, [recording, timer, coachOn, speak]);

  const persistCapture = async (
    file: File,
    phase: 'before' | 'after' | 'baseline',
    slot: number,
  ) => {
    await uploadLogPhoto(todayKey, phase, file, slot);
  };

  const ensureBaselineStored = async () => {
    const { urls } = await loadBaselineUrls();
    if (!baselineSlotsReady(urls)) {
      throw new Error('baseline 3곳 업로드가 확인되지 않았습니다. 다시 촬영해 주세요.');
    }
  };

  const finalizeAllSlots = async (captures: File[]) => {
    setError('');
    setProcessing(true);

    try {
      if (mode === 'baseline') {
        setPhase('scanning');
        await evaluateAllBaselineSlots(captures, SLOTS);
        await ensureBaselineStored();
        await updateFamilyProfile({ baseline_verified: true });
        if (coachOn) speak(baselinePassSpeech());
        else showSubtitle(baselinePassSpeech());
        if (nextHref) router.push(nextHref);
        else onComplete?.();
        return;
      }

      if (mode === 'dirty') {
        setPhase('scanning');
        const res = await scanAllSlotCaptures(captures, SLOTS);
        setScanResult(monstersToQuest(res.monsters), res.pollution, res.summary);
        if (coachOn) speak(dirtyScanDoneSpeech());
        else showSubtitle(dirtyScanDoneSpeech());
        if (nextHref) router.push(nextHref);
        else onComplete?.();
        return;
      }

      setPhase('verifying');
      let urlsForCompare = baselineUrls;
      if (!baselineSlotsReady(baselineUrls)) {
        const loaded = await loadBaselineUrls();
        urlsForCompare = loaded.urls;
        if (!baselineSlotsReady(urlsForCompare)) {
          throw new Error('부모 baseline 3곳·AI 평가가 완료되지 않았습니다.');
        }
        setBaselineUrls(urlsForCompare);
      }
      const res = await compareAllSlotsWithBaseline(captures, urlsForCompare, SLOTS);
      setVerifyResult(res.cleanliness, res.comment);
      await patchLogMeta(todayKey, { score: res.cleanliness, streak_days: streakDays });
      const afterMsg = afterCompareSpeech(res.cleanliness);
      if (coachOn) speak(afterMsg);
      else showSubtitle(afterMsg);
      if (nextHref) router.push(nextHref);
      else onComplete?.();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'AI 평가에 실패했습니다.';
      if (mode === 'baseline') resetCaptures();
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
        setGhostAligned(false);
        goToSlot(next);
        speak(slotTransitionSpeech(next, captureKind));
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
    speak(recordingStartSpeech(slotIdx));

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
            onClick={toggleCoach}
            aria-pressed={coachOn}
            aria-label={coachOn ? '음성 코치 끄기' : '음성 코치 켜기'}
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
          {photoFallbackOnly && (
            <button
              type="button"
              onClick={() => setCaptureKind('photo')}
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${captureKind === 'photo' ? 'bg-[#00b8cf] text-white' : 'bg-white/15'}`}
            >
              사진3장
            </button>
          )}
        </div>
      </div>

      <p className="mt-2 text-sm text-white/70">
        {slotsDone}/{SLOT_COUNT}곳 · {captureKind === 'video' ? '20초 영상' : '사진 1장'} × 3
        {mode === 'after' && !baselineSlotsReady(baselineUrls) && ' · ⚠ 부모 baseline 미등록'}
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
        {showGhostMedia && ghostUrl && (
          <GhostBaselineMedia
            url={ghostUrl}
            onError={() => setGhostMediaFailed(true)}
          />
        )}
        {ghostMediaBroken && <GhostBaselineUnavailable />}
        {ghostMediaMissing && <GhostBaselineMissingHint />}
        {!!ghostUrl && !ghostMediaFailed && <GhostSlotGuide slotIdx={ghostSlot} />}
        <GhostAlignmentBar
          slotIdx={ghostSlot}
          aligned={ghostAligned}
          onAlignedChange={setGhostAligned}
          showGhost={showGhostMedia}
        />
        <GhostSlotBadge slotIdx={ghostSlot} showGhost={showGhostMedia} />
        <GhostBottomCue slotIdx={ghostSlot} showGhost={showGhostMedia} />
        {recording && (
          <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-[#f04452] px-2.5 py-1 text-[10px] font-bold">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            REC
          </div>
        )}
        <CoachSubtitle
          text={subtitle}
          placeholder={subtitlePlaceholder(showGhostMedia, slotIdx)}
          priority={error ? 'assertive' : 'polite'}
        />
      </div>

      <div className="mt-4 flex gap-2">
        {SLOTS.map((s, i) => {
          const done = !!slotCaptures[i];
          const active = i === slotIdx && !done;
          const hasBaseline = !!baselineUrls[i];
          return (
            <button
              key={s}
              type="button"
              disabled={done || processing}
              onClick={() => {
                if (!done && !processing) goToSlot(i);
              }}
              className={`flex-1 rounded-lg py-2 text-center text-[10px] font-semibold leading-tight disabled:opacity-70 ${
                done ? 'bg-[#00c73c] text-white' : active ? 'bg-[#00b8cf] text-white' : 'bg-white/10 text-white/60'
              }`}
            >
              {done ? '✓ ' : ''}
              {ghostSlotConfig(i).tabLabel}
              {mode !== 'baseline' && !hasBaseline && !done && (
                <span className="mt-0.5 block text-[9px] font-normal text-[#ffc9c9]">baseline 없음</span>
              )}
            </button>
          );
        })}
      </div>
      {mode !== 'baseline' && showGhostMedia && (
        <p className="mt-2 text-center text-[10px] text-white/45">
          {ghostSlotConfig(slotIdx).alignTargets}
        </p>
      )}

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
                .catch(() => speak(coachHintFallback()));
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
