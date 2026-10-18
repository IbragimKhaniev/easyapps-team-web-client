/** Адреса страниц — одно место на всё приложение. */
export const PATHS = {
  login: '/login',
  overview: '/',
  myTasks: '/my',
  tasks: '/tasks',
  settings: '/settings',
  more: '/more',
  media: {
    root: '/media',
    plan: '/media/plan',
    library: '/media/library',
    feed: '/media/feed',
    analytics: '/media/analytics',
    settings: '/media/settings',
  },
} as const;

/**
 * Карточка задачи открывается поверх текущей страницы — ключ в `?task=`.
 * Так список или доска остаются на месте (как «peek» в Linear).
 */
export const TASK_PARAM = 'task';

/** Прямая ссылка на задачу: `/tasks/EA-42` перенаправляется на список с открытой карточкой. */
export const taskHref = (key: string): string => `${PATHS.tasks}/${encodeURIComponent(key)}`;
