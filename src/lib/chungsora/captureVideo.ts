/** 슬롯당 녹화 길이(초) */
export const CAPTURE_DURATION_SEC = 5;

/** BFF 한도: Vercel 경유 업로드 ~4MB 이하 목표 */
export const CAPTURE_VIDEO_BITS_PER_SECOND = 650_000;

export const CAPTURE_CAMERA_CONSTRAINTS: MediaTrackConstraints = {
  facingMode: { ideal: 'environment' },
  width: { ideal: 1280 },
  height: { ideal: 720 },
};

/** 영상 Blob → AI scan/verify용 JPEG 프레임 추출 */
export async function extractVideoFrame(blob: Blob, atRatio = 0.5): Promise<File> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(blob);
    video.src = url;
    video.muted = true;
    video.playsInline = true;

    const cleanup = () => URL.revokeObjectURL(url);

    video.onloadedmetadata = () => {
      video.currentTime = Math.max(0, video.duration * atRatio);
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        cleanup();
        reject(new Error('canvas unavailable'));
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (jpeg) => {
          cleanup();
          if (!jpeg) {
            reject(new Error('frame encode failed'));
            return;
          }
          resolve(new File([jpeg], 'frame.jpg', { type: 'image/jpeg' }));
        },
        'image/jpeg',
        0.88,
      );
    };

    video.onerror = () => {
      cleanup();
      reject(new Error('video load failed'));
    };
  });
}

export function pickRecorderMime(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined;
  for (const t of ['video/webm;codecs=vp8', 'video/webm', 'video/mp4']) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return undefined;
}

export function createCaptureRecorder(stream: MediaStream): MediaRecorder {
  const mime = pickRecorderMime();
  const options: MediaRecorderOptions = { videoBitsPerSecond: CAPTURE_VIDEO_BITS_PER_SECOND };
  if (mime) options.mimeType = mime;
  return new MediaRecorder(stream, options);
}
