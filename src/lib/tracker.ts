import { TaskPriority, TaskStatus } from '@/api/models';

/**
 * Справочник статусов и приоритетов на фронте: подписи, цвета, порядок.
 * Набор значений — из swagger (orval), здесь только то, как их показывать.
 */

export interface IStatusMeta {
  label: string;
  /** Короткая подпись — для чипов на узком экране. */
  short: string;
  /** Цвет иконки статуса. */
  color: string;
  /** Чип: фон, текст, рамка. */
  chip: string;
  /** Колонка доски: заливка шапки. */
  column: string;
}

export const STATUS_ORDER: TaskStatus[] = [
  TaskStatus.backlog,
  TaskStatus.todo,
  TaskStatus.in_progress,
  TaskStatus.review,
  TaskStatus.done,
  TaskStatus.canceled,
];

/** Колонки доски: отменённые на доске не показываем. */
export const BOARD_STATUSES: TaskStatus[] = [
  TaskStatus.backlog,
  TaskStatus.todo,
  TaskStatus.in_progress,
  TaskStatus.review,
  TaskStatus.done,
];

export const OPEN_STATUSES: TaskStatus[] = [
  TaskStatus.backlog,
  TaskStatus.todo,
  TaskStatus.in_progress,
  TaskStatus.review,
];

export const STATUS_META: Record<TaskStatus, IStatusMeta> = {
  backlog: {
    label: 'Бэклог',
    short: 'Бэклог',
    color: '#94A3B8',
    chip: 'bg-slate-100 text-slate-600 border-slate-200',
    column: 'bg-slate-100',
  },
  todo: {
    label: 'К работе',
    short: 'К работе',
    color: '#64748B',
    chip: 'bg-white text-ink-soft border-black/10',
    column: 'bg-slate-100',
  },
  in_progress: {
    label: 'В работе',
    short: 'В работе',
    color: '#F59E0B',
    chip: 'bg-amber-50 text-amber-700 border-amber-200',
    column: 'bg-amber-50',
  },
  review: {
    label: 'На проверке',
    short: 'Проверка',
    color: '#8B5CF6',
    chip: 'bg-violet-50 text-violet-700 border-violet-200',
    column: 'bg-violet-50',
  },
  done: {
    label: 'Готово',
    short: 'Готово',
    color: '#0B82B5',
    chip: 'bg-brand-50 text-brand-800 border-brand-200',
    column: 'bg-brand-50',
  },
  canceled: {
    label: 'Отменено',
    short: 'Отмена',
    color: '#9CA3AF',
    chip: 'bg-zinc-100 text-zinc-500 border-zinc-200',
    column: 'bg-zinc-100',
  },
};

export interface IPriorityMeta {
  label: string;
  color: string;
  /** Сколько «столбиков» закрашено в иконке (0–3), срочно — восклицательный знак. */
  bars: number;
}

export const PRIORITY_ORDER: TaskPriority[] = [
  TaskPriority.urgent,
  TaskPriority.high,
  TaskPriority.medium,
  TaskPriority.low,
  TaskPriority.none,
];

export const PRIORITY_META: Record<TaskPriority, IPriorityMeta> = {
  urgent: { label: 'Срочно', color: '#EF4444', bars: 3 },
  high: { label: 'Высокий', color: '#F97316', bars: 3 },
  medium: { label: 'Средний', color: '#EAB308', bars: 2 },
  low: { label: 'Низкий', color: '#0B82B5', bars: 1 },
  none: { label: 'Без приоритета', color: '#9CA3AF', bars: 0 },
};

/** Палитра проектов и меток — та же, что принимает сервер (TRACKER_PALETTE). */
export const TRACKER_PALETTE = [
  '#3CC1F6',
  '#0C76A8',
  '#6366F1',
  '#A855F7',
  '#EC4899',
  '#F43F5E',
  '#F97316',
  '#EAB308',
  '#22C55E',
  '#14B8A6',
  '#64748B',
  '#1F2937',
] as const;

export const isOpenStatus = (status: TaskStatus): boolean => OPEN_STATUSES.includes(status);
