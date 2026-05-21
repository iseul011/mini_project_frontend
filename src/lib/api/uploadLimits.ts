/** Vercel Serverless 요청 본문 한도(~4.5MB) — BFF 경유 업로드 안전 상한 */
export const BFF_SAFE_UPLOAD_BYTES = 4_000_000;

export const UPLOAD_TOO_LARGE_MESSAGE =
  '사진 용량이 너무 커서 업로드할 수 없어요. 다시 촬영해 주세요.';

export function isUploadTooLargeForBff(bytes: number): boolean {
  return bytes > BFF_SAFE_UPLOAD_BYTES;
}
