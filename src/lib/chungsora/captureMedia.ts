import { extractVideoFrame } from '@/lib/chungsora/captureVideo';

/** baseline URL(이미지·영상) → AI 비교용 JPEG 프레임 */
export async function frameFromBaselineUrl(url: string): Promise<File> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('baseline 미디어를 불러오지 못했습니다.');
  const blob = await res.blob();
  const type = blob.type || '';
  if (type.startsWith('image/')) {
    return new File([blob], 'baseline.jpg', { type: type || 'image/jpeg' });
  }
  const videoFile = new File([blob], 'baseline.webm', { type: type || 'video/webm' });
  return extractVideoFrame(videoFile);
}

export async function framesFromCaptures(captures: (File | null)[]): Promise<File[]> {
  const out: File[] = [];
  for (let i = 0; i < captures.length; i++) {
    const cap = captures[i];
    if (!cap || cap.size === 0) {
      throw new Error(`슬롯 ${i + 1} 촬영이 없습니다. 다시 촬영해 주세요.`);
    }
    const mime = cap.type ?? '';
    if (!mime.startsWith('image/')) {
      throw new Error(`슬롯 ${i + 1}은 사진(JPEG/PNG)만 업로드할 수 있어요.`);
    }
    out.push(cap);
  }
  return out;
}
