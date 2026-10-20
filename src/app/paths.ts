/** Адреса страниц — одно место на всё приложение. */
export const PATHS = {
  login: '/login',
  overview: '/',
  myTasks: '/my',
  tasks: '/tasks',
  settings: '/settings',
  more: '/more',
  journal: '/journal',
  journalReview: '/journal/review',
  agents: '/agents',
  knowledge: '/knowledge',
  pipeline: '/pipeline',
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

/** Работа журнала поверх любого экрана: `?work=<id>` — ход работы целиком. */
export const WORK_PARAM = 'work';

/** Ссылка на работу журнала: открывается поверх ленты журнала. */
export const workHref = (id: string): string => `${PATHS.journal}?${WORK_PARAM}=${encodeURIComponent(id)}`;

/** Запись базы знаний поверх страницы базы: `?entry=<id>`. */
export const KNOWLEDGE_ENTRY_PARAM = 'entry';

export const knowledgeHref = (id: string): string => `${PATHS.knowledge}?${KNOWLEDGE_ENTRY_PARAM}=${encodeURIComponent(id)}`;

/** Вкладки конвейера роликов: `/pipeline/<конвейер>/<вкладка>`, обзор — без вкладки. */
export const PIPELINE_TABS = ['cast', 'library', 'videos', 'log'] as const;
export type TPipelineTab = typeof PIPELINE_TABS[number];

/** Клетка библиотеки, ролик и герой — поверх вкладки: `?cell=artem/b01`, `?video=R-014`, `?hero=artem`. */
export const PIPELINE_CELL_PARAM = 'cell';
export const PIPELINE_VIDEO_PARAM = 'video';
export const PIPELINE_HERO_PARAM = 'hero';

export const pipelineHref = (project: string, tab?: TPipelineTab | null): string =>
  `${PATHS.pipeline}/${encodeURIComponent(project)}${tab ? `/${tab}` : ''}`;
