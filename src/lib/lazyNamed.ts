import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

import { handleChunkLoadFailure } from './appUpdate';

/**
 * Любой компонент — как в ограничении самого `React.lazy`: пропсы ленивый
 * компонент берёт из настоящего, а `ComponentType<unknown>` или `<never>` не
 * пропускают компоненты с пропсами (TaskDetail) в строгом режиме.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- то же ограничение, что у React.lazy
type AnyComponent = ComponentType<any>;

/**
 * Ленивый компонент по имени экспорта: `lazyNamed(() => import('./TasksPage'), 'TasksPage')`.
 * Ленивое подключаем только так: не загрузился чанк (вкладка пережила выкат) —
 * экран «Платформа обновилась» с перезапуском, а не ошибка роутера.
 */
export const lazyNamed = <K extends string, M extends Record<K, AnyComponent>>(
  load: () => Promise<M>,
  name: K,
): LazyExoticComponent<M[K]> =>
  lazy(() =>
    load()
      .then((module) => ({ default: module[name] }))
      .catch(handleChunkLoadFailure),
  );
