import { BFF_SAFE_UPLOAD_BYTES } from '@/lib/api/uploadLimits';
import { extractVideoFrame } from '@/lib/chungsora/captureVideo';

/**
 * Vercel BFF(4.5MB) 통과용 업로드 파일.
 * slotCaptures의 원본 File은 유지하고, 서버 업로드용만 축소할 수 있음.
 */
export async function prepareUploadFile(file: File | Blob): Promise<File> {
  if (file instanceof File && file.size <= BFF_SAFE_UPLOAD_BYTES) return file;
  if (!(file instanceof File) && file.size <= BFF_SAFE_UPLOAD_BYTES) {
    return new File([file], 'capture.bin', { type: file.type || 'application/octet-stream' });
  }
  if (file.type.startsWith('video/')) {
    return extractVideoFrame(file, 0.35);
  }
  if (file instanceof File) return file;
  return new File([file], 'capture.bin', { type: file.type || 'application/octet-stream' });
}
