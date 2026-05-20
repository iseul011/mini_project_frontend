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

export async function framesFromCaptures(captures: File[]): Promise<File[]> {
  const out: File[] = [];
  for (const cap of captures) {
    if (cap.type.startsWith('image/')) {
      out.push(cap);
    } else {
      out.push(await extractVideoFrame(cap));
    }
  }
  return out;
}
