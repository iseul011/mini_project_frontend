import {
  compareWithBaseline,
  evaluateBaselineSlot,
  scanRoom,
} from '@/app/cleaning/api';
import { frameFromBaselineUrl, framesFromCaptures } from '@/lib/chungsora/captureMedia';

const SLOT_COUNT = 3;

function isGeminiResult(modelId?: string) {
  return !!modelId && modelId !== 'fallback';
}

function assertCaptureFiles(captures: (File | null)[], label: string): File[] {
  if (captures.length !== SLOT_COUNT) {
    throw new Error(`${SLOT_COUNT}개 ${label}이 모두 필요합니다.`);
  }
  for (let i = 0; i < SLOT_COUNT; i++) {
    if (!captures[i] || captures[i]!.size === 0) {
      throw new Error(`${slotLabelsFromIndex(i)} ${label}이 없습니다. 다시 촬영해 주세요.`);
    }
  }
  return captures as File[];
}

function slotLabelsFromIndex(i: number): string {
  return ['입구', '바닥', '책상'][i] ?? `슬롯 ${i + 1}`;
}

export async function scanAllSlotCaptures(captures: (File | null)[], slotLabels: readonly string[]) {
  const files = assertCaptureFiles(captures, '슬롯 촬영');
  const frames = await framesFromCaptures(files);
  const results = await Promise.all(
    frames.map((frame, i) => scanRoom(frame, 'room-1', `지민 방 · ${slotLabels[i]}`)),
  );

  if (results.every((r) => !isGeminiResult(r.model_id))) {
    throw new Error('Gemini AI 스캔에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.');
  }

  const monsterMap = new Map<string, (typeof results)[0]['monsters'][0]>();
  for (const r of results) {
    for (const m of r.monsters) monsterMap.set(m.id, m);
  }

  const pollution = Math.round(
    results.reduce((sum, r) => sum + r.pollution_level, 0) / results.length,
  );
  const summary = results.map((r, i) => `[${slotLabels[i]}] ${r.summary}`).join(' ');

  return {
    monsters: [...monsterMap.values()],
    pollution,
    summary,
    model_id: results.find((r) => isGeminiResult(r.model_id))?.model_id,
  };
}

export async function evaluateAllBaselineSlots(captures: (File | null)[], slotLabels: readonly string[]) {
  const files = assertCaptureFiles(captures, 'baseline 촬영');
  const frames = await framesFromCaptures(files);
  const results = await Promise.all(
    frames.map((frame, i) => evaluateBaselineSlot(frame, slotLabels[i])),
  );

  if (results.every((r) => !isGeminiResult(r.model_id))) {
    throw new Error('Gemini baseline 평가에 연결하지 못했습니다.');
  }

  const failed = results.filter((r) => !r.acceptable);
  if (failed.length > 0) {
    const detail = results
      .map((r, i) => `${slotLabels[i]} ${r.quality_score}점${r.acceptable ? '' : '(불합격)'}`)
      .join(' · ');
    throw new Error(`baseline 품질 미달: ${detail}. 다시 촬영해 주세요.`);
  }

  return results;
}

export async function compareAllSlotsWithBaseline(
  afterCaptures: (File | null)[],
  baselineUrls: (string | null)[],
  slotLabels: readonly string[],
) {
  const files = assertCaptureFiles(afterCaptures, 'after 촬영');
  for (let i = 0; i < SLOT_COUNT; i++) {
    if (!baselineUrls[i]) {
      throw new Error(
        `부모 baseline ${slotLabels[i]}(${i + 1}/${SLOT_COUNT})가 등록되지 않았습니다. 부모가 baseline 촬영·AI 평가를 완료해야 해요.`,
      );
    }
  }

  const afterFrames = await framesFromCaptures(files);
  const results = await Promise.all(
    afterFrames.map(async (afterFrame, i) => {
      const baselineFrame = await frameFromBaselineUrl(baselineUrls[i]!);
      return compareWithBaseline(baselineFrame, afterFrame, slotLabels[i]!);
    }),
  );

  if (results.every((r) => !isGeminiResult(r.model_id))) {
    throw new Error('Gemini baseline 비교 채점에 연결하지 못했습니다.');
  }

  const cleanliness = Math.min(...results.map((r) => r.cleanliness));
  const detail = results.map((r, i) => `${slotLabels[i]} ${r.cleanliness}점`).join(' · ');
  const tail = results[results.length - 1]?.comment ?? '';
  const comment = `baseline 비교 · ${detail}. ${tail}`.trim();

  return {
    cleanliness,
    comment,
    model_id: results.find((r) => isGeminiResult(r.model_id))?.model_id,
  };
}

export { SLOT_COUNT };
