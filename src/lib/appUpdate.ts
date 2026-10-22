/**
 * Сбой загрузки чанка после выката — одно решение на всё приложение: ленивые
 * страницы и окна (`lazyNamed`), экран ошибки роутера (`RouteError`) и событие
 * Vite `vite:preloadError` — так собранное приложение сообщает о любом упавшем
 * import().
 *
 * После выката старых чанков на хостинге нет: вкладка, открытая раньше, падает
 * на первой же ленивой странице («Failed to fetch dynamically imported
 * module»), и роутер показывал голое «Unexpected Application Error!». Лечит
 * перезагрузка — свежий index.html знает новые имена файлов. Перед ней человек
 * видит экран «Платформа обновилась» (`AppUpdateScreen`) с отсчётом и кнопкой.
 *
 * Два правила против петли перезагрузок — те же, что в easyapps-web-client
 * (`src/lib/chunk-reload.ts`), где петля однажды случилась на проде:
 *
 * 1. Страница уже уходит — экрана нет. Начав переход (редирект на вход по 401),
 *    Safari обрывает недогруженные модули, и import() падает — это не выкат.
 *    На iOS `beforeunload` не приходит, поэтому свои редиректы отмечаем явно —
 *    `markPageLeaving()`.
 * 2. Сами перезагружаемся не чаще раза в CHUNK_RELOAD_COOLDOWN_MS на адрес.
 *    Чанк упал снова сразу после перезагрузки — это уже сеть или сломанный
 *    выкат: экран остаётся без отсчёта, перезапуск — кнопкой.
 */

const CHUNK_RELOAD_COOLDOWN_MS = 30_000;
/** Сколько считаем страницу уходящей: переход могли и отменить. */
const LEAVING_WINDOW_MS = 5_000;
/** Метка последней перезагрузки по сбою чанка — своя у каждого адреса. */
const RELOAD_MARK_PREFIX = 'chunk_reload_at:';

/**
 * Как браузеры говорят «не загрузился чанк»: Chrome и Firefox — «… dynamically
 * imported module», Safari — «Importing a module script failed.», а если на месте
 * пропавшего файла хостинг отдал index.html (SPA-заглушка отвечает 200 с HTML) —
 * «'text/html' is not a valid JavaScript MIME type.». CSS ленивой страницы Vite
 * подгружает сам и падает с «Unable to preload CSS for …».
 */
const CHUNK_LOAD_MESSAGE_RE =
  /dynamically imported module|Importing a module script failed|not a valid JavaScript MIME type|Unable to preload CSS/i;

/** Экран «Платформа обновилась»: идёт ли отсчёт до перезагрузки. */
export interface IAppUpdateRequest {
  autoReload: boolean;
}

let leavingAt = 0;
let appUpdate: IAppUpdateRequest | null = null;
const appUpdateListeners = new Set<() => void>();

/** Ошибка «не загрузился ленивый чанк» — устаревшая вкладка или обрыв сети. */
export const isChunkLoadError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  return CHUNK_LOAD_MESSAGE_RE.test(message);
};

/** Страница сейчас уйдёт на другой адрес — отмечаем перед своим редиректом. */
export const markPageLeaving = (): void => {
  leavingAt = Date.now();
};

const isPageLeaving = (): boolean => Date.now() - leavingAt < LEAVING_WINDOW_MS;

/**
 * Право перезагрузиться самим — правило №2. Метку ставим сразу, ещё до
 * отсчёта: не записалась — отсчёта нет, иначе петлю было бы нечем остановить.
 */
const claimAutoReload = (): boolean => {
  try {
    const key = RELOAD_MARK_PREFIX + window.location.pathname;
    const lastReloadAt = Number(sessionStorage.getItem(key)) || 0;
    if (Date.now() - lastReloadAt <= CHUNK_RELOAD_COOLDOWN_MS) return false;
    sessionStorage.setItem(key, String(Date.now()));
    return true;
  } catch {
    return false;
  }
};

/** Показать экран «Платформа обновилась». Повторные вызовы ничего не меняют. */
export const requestAppUpdate = (): void => {
  if (appUpdate || isPageLeaving()) return;
  appUpdate = { autoReload: claimAutoReload() };
  appUpdateListeners.forEach((listener) => listener());
};

export const subscribeAppUpdate = (listener: () => void): (() => void) => {
  appUpdateListeners.add(listener);
  return () => appUpdateListeners.delete(listener);
};

export const getAppUpdate = (): IAppUpdateRequest | null => appUpdate;

/** Перезагрузка за свежей версией: страница уходит, сбои чанков — не в счёт. */
export const reloadApp = (): void => {
  markPageLeaving();
  window.location.reload();
};

/** Чем кончится ленивый import(), который ни во что не разрешится. */
const never = () => new Promise<never>(() => undefined);

/**
 * Решает судьбу упавшего import(): переждать уже начатый уход со страницы,
 * показать экран обновления или отдать ошибку роутеру — модуль загрузился, но
 * упал при выполнении, и перезагрузка тут не поможет.
 */
export const handleChunkLoadFailure = (error: unknown): Promise<never> => {
  if (isPageLeaving()) return never();
  if (!isChunkLoadError(error)) return Promise.reject(error);
  requestAppUpdate();
  return never();
};

if (typeof window !== 'undefined') {
  // Уход по ссылке или вводу адреса: приходит до того, как браузер оборвёт
  // загрузки (кроме iOS — там его нет вовсе).
  window.addEventListener('beforeunload', markPageLeaving);
  // Ошибку не гасим (preventDefault): она идёт дальше своим путём, а экран
  // обновления её уже накрыл. Упавшее выполнение модуля — не выкат, мимо.
  window.addEventListener('vite:preloadError', (event) => {
    if (isChunkLoadError(event.payload)) requestAppUpdate();
  });
}
