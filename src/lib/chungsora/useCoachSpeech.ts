'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const SPEAK_DELAY_MS = 100;
const IOS_RESUME_MS = 80;
const DEFAULT_RATE = 0.95;
const DEFAULT_PITCH = 1;

export type CoachSpeakOptions = {
  /** 코치 OFF여도 음성 재생 (오류 안내 등) */
  force?: boolean;
  /** 자막만 갱신, TTS 생략 */
  silent?: boolean;
};

function pickKoreanVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const ko = voices.filter((v) => v.lang.toLowerCase().startsWith('ko'));
  if (!ko.length) return undefined;
  const local = ko.find((v) => v.localService);
  const named = ko.find((v) => /yuna|heera|nara|google|microsoft/i.test(v.name));
  return local ?? named ?? ko[0];
}

export function stopCoachSpeech(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

function utterance(text: string): SpeechSynthesisUtterance {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ko-KR';
  u.rate = DEFAULT_RATE;
  u.pitch = DEFAULT_PITCH;
  const voice = pickKoreanVoice(window.speechSynthesis.getVoices());
  if (voice) u.voice = voice;
  return u;
}

/** iOS Safari: voices 목록·재생 깨우기 */
function primeSpeechSynthesis(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.getVoices();
  const u = new SpeechSynthesisUtterance('');
  u.volume = 0;
  u.lang = 'ko-KR';
  window.speechSynthesis.speak(u);
  window.speechSynthesis.cancel();
}

/**
 * Web Speech API 기반 코치 TTS + 자막.
 * - cancel 후 짧은 지연으로 겹침·iOS 끊김 완화
 * - 연속 호출은 마지막 문장만 재생
 */
export function useCoachSpeech(enabled: boolean) {
  const [subtitle, setSubtitle] = useState('');
  const enabledRef = useRef(enabled);
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iosResumeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  enabledRef.current = enabled;

  useEffect(() => {
    primeSpeechSynthesis();
    const onVoices = () => primeSpeechSynthesis();
    window.speechSynthesis?.addEventListener('voiceschanged', onVoices);
    return () => {
      window.speechSynthesis?.removeEventListener('voiceschanged', onVoices);
      if (delayRef.current) clearTimeout(delayRef.current);
      if (iosResumeRef.current) clearTimeout(iosResumeRef.current);
      stopCoachSpeech();
    };
  }, []);

  const runSpeak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    stopCoachSpeech();
    if (iosResumeRef.current) clearTimeout(iosResumeRef.current);
    iosResumeRef.current = setTimeout(() => {
      iosResumeRef.current = null;
      const u = utterance(text);
      window.speechSynthesis.speak(u);
    }, IOS_RESUME_MS);
  }, []);

  const speak = useCallback(
    (text: string, options?: CoachSpeakOptions) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setSubtitle(trimmed);
      if (options?.silent) return;
      if (!enabledRef.current && !options?.force) return;

      if (delayRef.current) clearTimeout(delayRef.current);
      delayRef.current = setTimeout(() => {
        delayRef.current = null;
        runSpeak(trimmed);
      }, SPEAK_DELAY_MS);
    },
    [runSpeak],
  );

  const showSubtitle = useCallback((text: string) => {
    const trimmed = text.trim();
    if (trimmed) setSubtitle(trimmed);
  }, []);

  const clearSubtitle = useCallback(() => setSubtitle(''), []);

  return { subtitle, speak, showSubtitle, clearSubtitle, stop: stopCoachSpeech };
}
