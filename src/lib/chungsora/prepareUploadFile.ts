import { BFF_SAFE_UPLOAD_BYTES } from '@/lib/api/uploadLimits';
import { extractVideoFrame } from '@/lib/chungsora/captureVideo';

function blobMime(file: Blob): string {
  return (file.type ?? '').toLowerCase();
}

function isVideoBlob(file: Blob): boolean {
  const mime = blobMime(file);
  if (mime.startsWith('video/')) return true;
  if (mime.startsWith('image/')) return false;
  if (file instanceof File && /\.(webm|mp4|mov)(\?|$)/i.test(file.name)) return true;
  return file.size > 200_000;
}

/**
 * Vercel BFF(4.5MB) 통과용 업로드 파일.
 * slotCaptures의 원본 File은 유지하고, 서버 업로드용만 축소할 수 있음.
 */
export async function prepareUploadFile(file: File | Blob | null | undefined): Promise<File> {
  if (!file || file.size === 0) {
    throw new Error('촬영 파일이 비어 있습니다. 다시 촬영해 주세요.');
  }

  if (file instanceof File && file.size <= BFF_SAFE_UPLOAD_BYTES && !isVideoBlob(file)) {
    return file;
  }
  if (!(file instanceof File) && file.size <= BFF_SAFE_UPLOAD_BYTES && !isVideoBlob(file)) {
    return new File([file], 'capture.bin', { type: blobMime(file) || 'application/octet-stream' });
  }

  if (isVideoBlob(file)) {
    return extractVideoFrame(file, 0.35);
  }

  if (file instanceof File) return file;
  return new File([file], 'capture.bin', { type: blobMime(file) || 'application/octet-stream' });
}
