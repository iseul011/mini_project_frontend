import { BFF_SAFE_UPLOAD_BYTES } from '@/lib/api/uploadLimits';

function blobMime(file: Blob): string {
  return (file.type ?? '').toLowerCase();
}

/**
 * Vercel BFF(4.5MB) 통과용 업로드 파일 (사진만).
 */
export async function prepareUploadFile(file: File | Blob | null | undefined): Promise<File> {
  if (!file || file.size === 0) {
    throw new Error('촬영 파일이 비어 있습니다. 다시 촬영해 주세요.');
  }

  const mime = blobMime(file);
  if (mime.startsWith('video/') || (!mime.startsWith('image/') && mime !== '')) {
    throw new Error('사진(JPEG/PNG)만 업로드할 수 있어요.');
  }
  if (file.size > BFF_SAFE_UPLOAD_BYTES) {
    throw new Error('사진 용량이 너무 커요. 다시 촬영해 주세요.');
  }

  if (file instanceof File) return file;
  return new File([file], 'capture.jpg', { type: mime || 'image/jpeg' });
}
