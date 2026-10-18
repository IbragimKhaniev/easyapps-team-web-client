import type { MediaPostStatus, MediaTargetStatus } from '@/api/models';

export type TStatusTone = 'neutral' | 'brand' | 'progress' | 'success' | 'warning' | 'danger' | 'idea';

export interface IStatusMeta {
  label: string;
  tone: TStatusTone;
}

export const POST_STATUS_META: Record<MediaPostStatus, IStatusMeta> = {
  idea: { label: 'Идея', tone: 'idea' },
  draft: { label: 'Черновик', tone: 'neutral' },
  scheduled: { label: 'Запланирован', tone: 'brand' },
  publishing: { label: 'Публикуется', tone: 'progress' },
  published: { label: 'Опубликован', tone: 'success' },
  partial: { label: 'Частично', tone: 'warning' },
  failed: { label: 'Ошибка', tone: 'danger' },
  canceled: { label: 'Отменён', tone: 'neutral' },
};

export const TARGET_STATUS_META: Record<MediaTargetStatus, IStatusMeta> = {
  pending: { label: 'Ждёт', tone: 'brand' },
  publishing: { label: 'Публикуется', tone: 'progress' },
  processing: { label: 'Площадка обрабатывает файл', tone: 'progress' },
  published: { label: 'Вышел', tone: 'success' },
  failed: { label: 'Ошибка', tone: 'danger' },
  skipped: { label: 'Выключено', tone: 'neutral' },
};

/** Классы «пилюли» статуса: тон → цвет текста и фона. */
export const TONE_CLASSES: Record<TStatusTone, string> = {
  neutral: 'bg-black/[0.05] text-ink-soft',
  brand: 'bg-brand-50 text-brand-800',
  progress: 'bg-amber-50 text-amber-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-orange-50 text-orange-700',
  danger: 'bg-rose-50 text-rose-700',
  idea: 'border border-dashed border-ink-faint/60 text-ink-muted',
};

/** Точка статуса в календаре. */
export const TONE_DOT: Record<TStatusTone, string> = {
  neutral: 'bg-ink-faint',
  brand: 'bg-brand-500',
  progress: 'bg-amber-500',
  success: 'bg-emerald-500',
  warning: 'bg-orange-500',
  danger: 'bg-rose-500',
  idea: 'bg-transparent border border-ink-faint',
};

/** Пост ещё можно править целиком — как EDITABLE_STATUSES на сервере. */
export const EDITABLE_STATUSES: ReadonlyArray<MediaPostStatus> = ['idea', 'draft', 'scheduled', 'failed', 'canceled'];

export const isEditable = (status: MediaPostStatus): boolean => EDITABLE_STATUSES.includes(status);
