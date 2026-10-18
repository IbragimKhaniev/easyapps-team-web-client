/**
 * Что браузер может узнать о файле до загрузки: размеры картинки, размеры и
 * длительность видео и кадр-обложку, длительность аудио. Сервер видео не
 * декодирует (ffmpeg на боксе нет и не нужен) — обложку снимаем здесь.
 */

export interface IFileInfo {
  width?: number;
  height?: number;
  durationSec?: number;
  /** Кадр видео в JPEG — превью в медиатеке и календаре. */
  poster?: Blob;
}

/** Браузер не справился с файлом за это время — грузим без сведений, сервер не против. */
const PROBE_TIMEOUT_MS = 8_000;
const POSTER_WIDTH = 640;
const POSTER_QUALITY = 0.82;

const withTimeout = <T>(promise: Promise<T>, fallback: T): Promise<T> =>
  Promise.race([promise, new Promise<T>((resolve) => setTimeout(() => resolve(fallback), PROBE_TIMEOUT_MS))]);

const readImage = async (file: File): Promise<IFileInfo> => {
  try {
    const bitmap = await createImageBitmap(file);
    const info = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return info;
  } catch {
    // HEIC и прочее, что браузер не открывает, — размеры посчитает сервер.
    return {};
  }
};

const readVideo = (file: File): Promise<IFileInfo> =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    const finish = (info: IFileInfo) => {
      URL.revokeObjectURL(url);
      video.removeAttribute('src');
      video.load();
      resolve(info);
    };
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.onerror = () => finish({});
    video.onloadedmetadata = () => {
      // Кадр на первой секунде (или в начале короткого ролика) — чаще всего не чёрный.
      video.currentTime = Math.min(1, (video.duration || 0) / 4);
    };
    video.onseeked = () => {
      const info: IFileInfo = {
        width: video.videoWidth || undefined,
        height: video.videoHeight || undefined,
        durationSec: Number.isFinite(video.duration) ? Math.round(video.duration * 10) / 10 : undefined,
      };
      const scale = Math.min(1, POSTER_WIDTH / (video.videoWidth || POSTER_WIDTH));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round((video.videoWidth || POSTER_WIDTH) * scale));
      canvas.height = Math.max(1, Math.round((video.videoHeight || POSTER_WIDTH) * scale));
      const context = canvas.getContext('2d');
      if (!context) return finish(info);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => finish({ ...info, poster: blob ?? undefined }), 'image/jpeg', POSTER_QUALITY);
    };
    video.src = url;
  });

const readAudio = (file: File): Promise<IFileInfo> =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = document.createElement('audio');
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve({ durationSec: Number.isFinite(audio.duration) ? Math.round(audio.duration) : undefined });
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({});
    };
    audio.src = url;
  });

export const inspectFile = (file: File): Promise<IFileInfo> => {
  if (file.type.startsWith('image/')) return withTimeout(readImage(file), {});
  if (file.type.startsWith('video/')) return withTimeout(readVideo(file), {});
  if (file.type.startsWith('audio/')) return withTimeout(readAudio(file), {});
  return Promise.resolve({});
};
