export const AI_MODEL_ALERT_DEFAULT =
  'AI 모델(Gemini)을 불러오지 못했습니다. 네트워크·서버 배포 상태를 확인한 뒤 다시 시도해 주세요.';

/** Gemini·AI 채점·백엔드 연결 실패 메시지 (촬영/품질 안내는 제외) */
export function isAiModelError(message: string): boolean {
  if (/품질 미달|등록되지 않았습니다|슬롯.*필요|촬영이 모두 필요/i.test(message)) {
    return false;
  }
  return /gemini|AI|스캔|채점|평가|model|502|503|404|not found|연결|불러|failed to fetch|백엔드/i.test(message);
}
