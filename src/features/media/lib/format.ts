import type { MediaKind, SocialContentType } from '@/api/models';

const KB = 1024;
const MB = KB * 1024;
const GB = MB * 1024;

/** «12,4 МБ». */
export const formatBytes = (bytes: number): string => {
  if (bytes >= GB) return `${(bytes / GB).toFixed(1).replace('.', ',')} ГБ`;
  if (bytes >= MB) return `${(bytes / MB).toFixed(1).replace('.', ',')} МБ`;
  if (bytes >= KB) return `${Math.round(bytes / KB)} КБ`;
  return `${bytes} Б`;
};

/** 65 → «1:05», 3725 → «1:02:05». */
export const formatDuration = (seconds: number): string => {
  const total = Math.max(0, Math.round(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = String(total % 60).padStart(2, '0');
  return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${rest}` : `${minutes}:${rest}`;
};

const compact = new Intl.NumberFormat('ru-RU', { notation: 'compact', maximumFractionDigits: 1 });
const plain = new Intl.NumberFormat('ru-RU');

/** 12 400 → «12,4 тыс.»; null — «—». */
export const formatCompact = (value: number | null | undefined): string =>
  value === null || value === undefined ? '—' : value < 10_000 ? plain.format(value) : compact.format(value);

/** 12400 → «12 400». */
export const formatNumber = (value: number | null | undefined): string =>
  value === null || value === undefined ? '—' : plain.format(value);

/** 3.456 → «3,46 %» (пробел неразрывный — процент не переносится отдельно). */
export const formatPercent = (value: number | null | undefined): string =>
  value === null || value === undefined ? '—' : `${value.toFixed(value >= 10 ? 1 : 2).replace('.', ',')}\u00a0%`;

/** Знак изменения: «+12», «−3», «0». */
export const formatDelta = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '—';
  if (value > 0) return `+${plain.format(value)}`;
  if (value < 0) return `−${plain.format(Math.abs(value))}`;
  return '0';
};

export const MEDIA_KIND_LABELS: Record<MediaKind, string> = {
  image: 'Фото',
  video: 'Видео',
  audio: 'Аудио',
  document: 'Документ',
};

export const CONTENT_TYPE_LABELS: Record<SocialContentType, string> = {
  text: 'Текст',
  photo: 'Фото',
  video: 'Видео',
  album: 'Альбом',
  reel: 'Рилс',
  story: 'История',
  document: 'Документ',
  audio: 'Аудио',
  other: 'Другое',
};
