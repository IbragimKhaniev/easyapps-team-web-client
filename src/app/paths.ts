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

/** Конструктор поста поверх экрана: `?post=<id>` или `?post=new&date=YYYY-MM-DD`. */
export const POST_PARAM = 'post';
export const POST_DATE_PARAM = 'date';
export const NEW_POST = 'new';

/** Пост контент-плана по ссылке — открывается поверх календаря. */
export const postHref = (id: string): string => `${PATHS.media.plan}?${POST_PARAM}=${encodeURIComponent(id)}`;

/** Прямая ссылка на задачу: `/tasks/EA-42` перенаправляется на список с открытой карточкой. */
export const taskHref = (key: string): string => `${PATHS.tasks}/${encodeURIComponent(key)}`;
