import { ghostSlotConfig } from '@/lib/chungsora/ghostSlots';

export type CaptureCoachMode = 'dirty' | 'after' | 'baseline';
export type CaptureCoachKind = 'video' | 'photo';

const SLOT_LABELS = ['입구', '바닥', '책상'] as const;

export function captureModeIntro(mode: CaptureCoachMode): string {
  if (mode === 'baseline') {
    return '입구, 바닥, 책상 세 곳 기준 영상을 찍어 주세요. 인공지능이 학습 가능한지 확인합니다.';
  }
  if (mode === 'dirty') {
    return '입구부터 촬영합니다. 부모가 찍어 둔 고스트 화면에 맞추고, 세 곳 모두 찍어야 해요.';
  }
  return '청소 후 영상을 부모 기준 화면과 비교합니다. 입구부터 세 곳 모두 찍어 주세요.';
}

export function slotBaselineMissing(slotIndex: number): string {
  const label = ghostSlotConfig(slotIndex).label;
  return `${label} 기준 사진이 없어요. 부모가 세 곳 기준 촬영을 먼저 끝내야 해요.`;
}

export function slotAlignSpeech(slotIndex: number): string {
  return ghostSlotConfig(slotIndex).ttsAlign;
}

export function slotTransitionSpeech(slotIndex: number, kind: CaptureCoachKind): string {
  const label = SLOT_LABELS[slotIndex] ?? ghostSlotConfig(slotIndex).label;
  const media = kind === 'video' ? '영상' : '사진';
  return `${label} ${media}을 이어서 찍어 주세요. ${ghostSlotConfig(slotIndex).ttsAlign}`;
}

export function recordingStartSpeech(slotIndex: number): string {
  const label = SLOT_LABELS[slotIndex] ?? ghostSlotConfig(slotIndex).label;
  return `${label} 촬영을 시작합니다. ${ghostSlotConfig(slotIndex).ttsAlign}`;
}

/** 녹화 중 남은 초 — 5초 촬영 시 2초 남음만 안내 */
export function recordingCountdownSpeech(secondsLeft: number): string | null {
  if (secondsLeft === 2) return '2초 남았어요.';
  return null;
}

export function baselineEvaluatingSpeech(): string {
  return '인공지능이 세 곳 기준을 검사해요. 슬롯당 최대 2분, 보통 30초 안쪽이에요.';
}

export function baselinePassSpeech(): string {
  return '세 곳 기준 촬영이 통과했어요. 이제 청소 시간을 설정해 주세요.';
}

export function dirtyScanDoneSpeech(): string {
  return '세 곳 스캔이 끝났어요. 청소 목록을 확인해 주세요.';
}

export function afterCompareSpeech(score: number): string {
  return `기준 비교 점수 ${score}점이에요. 수고했어요.`;
}

export function coachResumedSpeech(): string {
  return '음성 코치를 켰어요.';
}

export function coachPausedSpeech(): string {
  return '음성 코치를 껐어요. 자막만 표시됩니다.';
}

export function coachHintFallback(): string {
  return '책상 위부터 정리해 볼까요?';
}

export function subtitlePlaceholder(hasGhost: boolean, slotIndex: number): string {
  if (hasGhost) return ghostSlotConfig(slotIndex).bottomCue;
  return '코치 안내가 여기에 표시됩니다';
}
