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
  /** Согласие на вход приложения по OAuth (коннектор в Claude) — вне оболочки сайта. */
  oauthConsent: '/oauth/consent',
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

/** Конструктор поста поверх экрана: `?post=<id>` или `?post=new&date=YYYY-MM-DD[&media=<файл>]`. */
export const POST_PARAM = 'post';
export const POST_DATE_PARAM = 'date';
/** Файл медиатеки, с которым открыть новый пост (ролик конвейера, файл из медиатеки). */
export const POST_MEDIA_PARAM = 'media';
export const NEW_POST = 'new';

/** Пост контент-плана по ссылке — открывается поверх календаря. */
export const postHref = (id: string): string => `${PATHS.media.plan}?${POST_PARAM}=${encodeURIComponent(id)}`;

/** Новый пост в контент-плане на день — сразу с файлом медиатеки, если он задан. */
export const newPostHref = (date: string, mediaId?: string | null): string => {
  const params = new URLSearchParams({ [POST_PARAM]: NEW_POST, [POST_DATE_PARAM]: date });
  if (mediaId) params.set(POST_MEDIA_PARAM, mediaId);
  return `${PATHS.media.plan}?${params.toString()}`;
};

/** Прямая ссылка на задачу: `/tasks/EA-42` перенаправляется на список с открытой карточкой. */
export const taskHref = (key: string): string => `${PATHS.tasks}/${encodeURIComponent(key)}`;

/** Работа журнала поверх любого экрана: `?work=<id>` — ход работы целиком. */
export const WORK_PARAM = 'work';

/** Ссылка на работу журнала: открывается поверх ленты журнала. */
export const workHref = (id: string): string => `${PATHS.journal}?${WORK_PARAM}=${encodeURIComponent(id)}`;

/**
 * Страница согласия: `?request=<id>` от сервера входа (`/oauth/authorize`) или
 * `?error=client|redirect|server`, если вход не дошёл до согласия.
 */
export const OAUTH_REQUEST_PARAM = 'request';
export const OAUTH_ERROR_PARAM = 'error';

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

/** Ролик конвейера открытым поверх вкладки «Ролики». */
export const pipelineVideoHref = (project: string, video: string): string =>
  `${pipelineHref(project, 'videos')}?${PIPELINE_VIDEO_PARAM}=${encodeURIComponent(video)}`;
