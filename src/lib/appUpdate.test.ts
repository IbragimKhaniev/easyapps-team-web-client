import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const CHUNK_ERROR = new TypeError(
  'Failed to fetch dynamically imported module: https://team.easyapps.click/assets/TasksPage-CTwz7lJG.js',
);
const RELOAD_MARK = 'chunk_reload_at:/tasks';

// Тесты идут без браузера: модулю хватает адреса, sessionStorage и событий window.
const storage = new Map<string, string>();
const windowListeners = new Map<string, (event: { payload?: unknown }) => void>();
const reload = vi.fn();

/** Свежий модуль на каждый тест: экран и метка ухода живут на уровне модуля. */
const loadAppUpdate = async () => {
  vi.resetModules();
  return import('./appUpdate');
};

describe('сбой загрузки чанка', () => {
  beforeEach(() => {
    storage.clear();
    windowListeners.clear();
    reload.mockClear();
    vi.stubGlobal('sessionStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => void storage.set(key, value),
    });
    vi.stubGlobal('window', {
      location: { pathname: '/tasks', reload },
      addEventListener: (type: string, listener: (event: { payload?: unknown }) => void) =>
        windowListeners.set(type, listener),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('узнаёт сбой чанка по словам Chrome, Firefox, Safari и Vite', async () => {
    const { isChunkLoadError } = await loadAppUpdate();
    expect(isChunkLoadError(CHUNK_ERROR)).toBe(true);
    expect(isChunkLoadError(new TypeError('error loading dynamically imported module: /assets/x.js'))).toBe(true);
    expect(isChunkLoadError(new TypeError('Importing a module script failed.'))).toBe(true);
    expect(isChunkLoadError(new TypeError("'text/html' is not a valid JavaScript MIME type."))).toBe(true);
    expect(isChunkLoadError(new Error('Unable to preload CSS for /assets/TasksPage-CTwz7lJG.css'))).toBe(true);
    expect(isChunkLoadError(new TypeError("Cannot read properties of undefined (reading 'map')"))).toBe(false);
    expect(isChunkLoadError(undefined)).toBe(false);
  });

  it('первый сбой — экран с отсчётом и метка перезагрузки', async () => {
    const { handleChunkLoadFailure, getAppUpdate } = await loadAppUpdate();
    void handleChunkLoadFailure(CHUNK_ERROR);
    expect(getAppUpdate()).toEqual({ autoReload: true });
    expect(storage.has(RELOAD_MARK)).toBe(true);
  });

  it('второй сбой подряд — экран тот же, подписчики узнают о нём один раз', async () => {
    const { handleChunkLoadFailure, subscribeAppUpdate } = await loadAppUpdate();
    const listener = vi.fn();
    subscribeAppUpdate(listener);
    void handleChunkLoadFailure(CHUNK_ERROR);
    void handleChunkLoadFailure(CHUNK_ERROR);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('сбой сразу после перезагрузки — без отсчёта, только кнопка', async () => {
    storage.set(RELOAD_MARK, String(Date.now() - 5_000));
    const { handleChunkLoadFailure, getAppUpdate } = await loadAppUpdate();
    void handleChunkLoadFailure(CHUNK_ERROR);
    expect(getAppUpdate()).toEqual({ autoReload: false });
  });

  it('с прошлой перезагрузки прошло больше 30 с — снова с отсчётом', async () => {
    storage.set(RELOAD_MARK, String(Date.now() - 60_000));
    const { handleChunkLoadFailure, getAppUpdate } = await loadAppUpdate();
    void handleChunkLoadFailure(CHUNK_ERROR);
    expect(getAppUpdate()).toEqual({ autoReload: true });
  });

  it('страница уже уходит — экрана нет', async () => {
    const { handleChunkLoadFailure, markPageLeaving, getAppUpdate } = await loadAppUpdate();
    markPageLeaving();
    void handleChunkLoadFailure(CHUNK_ERROR);
    expect(getAppUpdate()).toBeNull();
  });

  it('модуль загрузился, но упал при выполнении — ошибка уходит роутеру', async () => {
    const { handleChunkLoadFailure, getAppUpdate } = await loadAppUpdate();
    const bug = new TypeError("Cannot read properties of undefined (reading 'map')");
    await expect(handleChunkLoadFailure(bug)).rejects.toBe(bug);
    expect(getAppUpdate()).toBeNull();
  });

  it('vite:preloadError: сбой загрузки — экран, ошибка выполнения модуля — мимо', async () => {
    const { getAppUpdate } = await loadAppUpdate();
    const onPreloadError = windowListeners.get('vite:preloadError');
    onPreloadError?.({ payload: new Error('x is not a function') });
    expect(getAppUpdate()).toBeNull();
    onPreloadError?.({ payload: new Error('Unable to preload CSS for /assets/TasksPage-CTwz7lJG.css') });
    expect(getAppUpdate()).toEqual({ autoReload: true });
  });

  it('перезапуск отмечает уход со страницы — оборванные чанки экран не вызывают', async () => {
    const { reloadApp, handleChunkLoadFailure, getAppUpdate } = await loadAppUpdate();
    reloadApp();
    expect(reload).toHaveBeenCalledTimes(1);
    void handleChunkLoadFailure(CHUNK_ERROR);
    expect(getAppUpdate()).toBeNull();
  });
});
