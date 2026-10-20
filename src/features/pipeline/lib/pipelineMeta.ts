import { PipelineActor, PipelineCellStatus, PipelineVideoStatus } from '@/api/models';

/**
 * Вид конвейера роликов: подписи и цвета статусов, группы сцен, части
 * раскладки. Статусы и форматы данных — как в папке конвейера (сервер:
 * team-api constants/pipeline.ts).
 */

export interface IStatusMeta {
  label: string;
  /** Пилюля: фон и текст. */
  pill: string;
  /** Отметка в полоске клипов героя. */
  tick: string;
}

export const CELL_STATUS_META: Record<PipelineCellStatus, IStatusMeta> = {
  todo: { label: 'Не снят', pill: 'bg-zinc-100 text-zinc-600', tick: 'bg-zinc-200' },
  progress: { label: 'В работе', pill: 'bg-amber-50 text-amber-800', tick: 'bg-amber-400' },
  done: { label: 'Готов', pill: 'bg-emerald-50 text-emerald-700', tick: 'bg-emerald-500' },
  rejected: { label: 'Брак', pill: 'bg-rose-50 text-rose-700', tick: 'bg-rose-400' },
};

/** Статусы, которые клетке ставят руками: «готов» — сам, по клипу. */
export const CELL_MANUAL_STATUSES = [PipelineCellStatus.todo, PipelineCellStatus.progress, PipelineCellStatus.rejected] as const;

export const VIDEO_STATUS_ORDER: PipelineVideoStatus[] = [
  PipelineVideoStatus.idea,
  PipelineVideoStatus.script,
  PipelineVideoStatus.build,
  PipelineVideoStatus.review,
  PipelineVideoStatus.changes,
  PipelineVideoStatus.approved,
  PipelineVideoStatus.published,
];

export const VIDEO_STATUS_META: Record<PipelineVideoStatus, IStatusMeta> = {
  idea: { label: 'Идея', pill: 'bg-zinc-100 text-zinc-600', tick: 'bg-zinc-300' },
  script: { label: 'Сценарий', pill: 'bg-violet-50 text-violet-700', tick: 'bg-violet-400' },
  build: { label: 'Сборка', pill: 'bg-sky-50 text-sky-800', tick: 'bg-sky-400' },
  review: { label: 'Проверка', pill: 'bg-amber-50 text-amber-800', tick: 'bg-amber-400' },
  changes: { label: 'Правки', pill: 'bg-rose-50 text-rose-700', tick: 'bg-rose-400' },
  approved: { label: 'Одобрено', pill: 'bg-emerald-50 text-emerald-700', tick: 'bg-emerald-500' },
  published: { label: 'Опубликовано', pill: 'bg-brand-50 text-brand-800', tick: 'bg-brand-500' },
};

export const isVideoStatus = (value: string): value is PipelineVideoStatus =>
  (VIDEO_STATUS_ORDER as string[]).includes(value);

export const videoStatusMeta = (status: string): IStatusMeta =>
  (isVideoStatus(status) ? VIDEO_STATUS_META[status] : { label: status, pill: 'bg-zinc-100 text-zinc-600', tick: 'bg-zinc-300' });

/** Решение людей возможно, пока ролик на проверке или уже решён (передумали). */
export const REVIEWABLE_STATUSES: PipelineVideoStatus[] = [PipelineVideoStatus.review, PipelineVideoStatus.changes, PipelineVideoStatus.approved];

/** Группы сцен библиотеки — доски сетки. Группа с id героя («заказчик») подписывается его именем. */
export const SCENE_GROUP_TITLES: Record<string, string> = {
  hero: 'Герои',
  family: 'Родные героев',
  client: 'Массовка',
};
export const SCENE_GROUP_ORDER = ['hero', 'family', 'client'];

/** Части раскладки ролика, которые не сцены библиотеки. */
export const TIMELINE_LABELS: Record<string, string> = {
  magic: 'Блок easyapps',
  end: 'Финал',
  comment: 'Комментарий',
  screens: 'Экраны',
  screen: 'Экран',
  title: 'Заголовок',
  split: 'Было / стало',
};

export const PHASE_META: Record<string, { label: string; dot: string }> = {
  done: { label: 'Готово', dot: 'bg-emerald-500' },
  active: { label: 'Идёт', dot: 'bg-brand-500' },
  todo: { label: 'Впереди', dot: 'bg-zinc-300' },
};

export const ACTOR_LABELS: Record<PipelineActor, string> = {
  people: 'Люди',
  agent: 'Агент',
};

export interface IPipelineRef {
  kind: 'video' | 'cell' | 'character' | 'scene' | 'doc';
  key: string;
}

/** `video:R-014` → { kind: 'video', key: 'R-014' }. */
export const parseRef = (ref: string | null | undefined): IPipelineRef | null => {
  if (!ref) return null;
  const [kind, ...rest] = ref.split(':');
  if (!kind || !rest.length) return null;
  return { kind: kind as IPipelineRef['kind'], key: rest.join(':') };
};

/** Суммарная длина раскладки ролика, секунды. */
export const timelineSeconds = (timeline: ReadonlyArray<ReadonlyArray<string | number>>): number =>
  timeline.reduce((sum, part) => sum + (Number(part[1]) || 0), 0);
