/** 고스트 오버레이 슬롯 (0=입구, 1=바닥, 2=책상) — 부모 baseline 키프레임과 동일 구도 */
export type GhostSlotIndex = 0 | 1 | 2;

export const GHOST_SLOT_COUNT = 3;

export const GHOST_OPACITY = 0.4;

export type GhostSlotConfig = {
  index: GhostSlotIndex;
  label: string;
  tabLabel: string;
  /** 슬롯 진입·촬영 시작 TTS */
  ttsAlign: string;
  /** 카메라 하단 코치 문구 */
  bottomCue: string;
  /** 미정렬 상태 배지 */
  misalignBadge: string;
  /** 정렬 포인트 요약 (UI) */
  alignTargets: string;
};

export const GHOST_SLOT_CONFIG: readonly GhostSlotConfig[] = [
  {
    index: 0,
    label: '입구',
    tabLabel: '① 입구 전경',
    ttsAlign: '문 틀 네 모서리와 바닥 경계선이 고스트와 겹치게 맞춰 주세요.',
    bottomCue: '문틀·원경 벽·바닥선 맞추기',
    misalignBadge: '문틀·바닥선 안 맞음',
    alignTargets: '문틀 4꼭짓점 · 원경 벽 · 바닥 경계선',
  },
  {
    index: 1,
    label: '바닥',
    tabLabel: '② 바닥 클로즈',
    ttsAlign: '바닥 영역과 양말·옷 위치가 고스트와 같게 맞춰 주세요. 천장은 보지 않아도 돼요.',
    bottomCue: '바닥·물건 위치 맞추기',
    misalignBadge: '바닥·물건 위치 안 맞음',
    alignTargets: '바닥 면적 · 양말·옷 위치 (천장 무시)',
  },
  {
    index: 2,
    label: '책상',
    tabLabel: '③ 책상',
    ttsAlign: '책상 윗면 가로선과 책상 모서리가 고스트와 겹치게 맞춰 주세요.',
    bottomCue: '책상선 맞추기',
    misalignBadge: '책상선·책장 가장자리 안 맞음',
    alignTargets: '책상 윗면 수평선 · 책상·책장 가장자리',
  },
] as const;

export function ghostSlotConfig(index: number): GhostSlotConfig {
  return GHOST_SLOT_CONFIG[Math.min(Math.max(index, 0), 2) as GhostSlotIndex];
}

export function isGhostVideoUrl(url: string): boolean {
  return (
    /\.(mp4|webm|mov)(\?|$)/i.test(url) ||
    /_(?:0|1|2)\.(mp4|webm)/i.test(url) ||
    /baseline_\d+\.(mp4|webm)/i.test(url)
  );
}
