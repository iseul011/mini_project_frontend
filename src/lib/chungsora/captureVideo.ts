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
  for (const t of ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4']) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return undefined;
}
