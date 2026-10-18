import type { QueryClient, QueryKey } from '@tanstack/react-query';

import { getGetActivityFeedQueryKey } from '@/api/generated/activity/activity';
import { getGetOverviewQueryKey } from '@/api/generated/overview/overview';
import { getListProjectsQueryKey } from '@/api/generated/projects/projects';
import { getGetTaskQueryKey, getListTasksQueryKey } from '@/api/generated/tasks/tasks';
import type { Task, TaskDetailResponse, TaskListResponse } from '@/api/models';

/**
 * Кэш задач в react-query: оптимистичные правки во всех открытых списках и
 * в карточке, снимок для отката и обновление производных экранов (сводка,
 * лента, счётчики проектов).
 *
 * Ключи списков — `['/tasks', params]`, карточки — `['/tasks/EA-42']`: префикс
 * `['/tasks']` задевает только списки.
 */
const LISTS_PREFIX = getListTasksQueryKey();

export type TCacheSnapshot = Array<[QueryKey, unknown]>;

export const snapshotTasks = (queryClient: QueryClient, key?: string): TCacheSnapshot => [
  ...queryClient.getQueriesData({ queryKey: LISTS_PREFIX }),
  ...(key ? queryClient.getQueriesData({ queryKey: getGetTaskQueryKey(key) }) : []),
];

export const restoreSnapshot = (queryClient: QueryClient, snapshot: TCacheSnapshot): void => {
  for (const [queryKey, data] of snapshot) queryClient.setQueryData(queryKey, data);
};

export const cancelTaskQueries = (queryClient: QueryClient, key?: string): Promise<unknown> =>
  Promise.all([
    queryClient.cancelQueries({ queryKey: LISTS_PREFIX }),
    key ? queryClient.cancelQueries({ queryKey: getGetTaskQueryKey(key) }) : null,
  ]);

/** Правка задачи по ключу во всех списках и в карточке. */
export const patchTaskEverywhere = (queryClient: QueryClient, key: string, patch: Partial<Task>): void => {
  queryClient.setQueriesData<TaskListResponse>({ queryKey: LISTS_PREFIX }, (current) => {
    if (!current) return current;
    return {
      ...current,
      data: {
        ...current.data,
        items: current.data.items.map((task) => (task.key === key ? { ...task, ...patch } : task)),
      },
    };
  });
  queryClient.setQueryData<TaskDetailResponse>(getGetTaskQueryKey(key), (current) =>
    current ? { ...current, data: { ...current.data, ...patch } } : current,
  );
};

/** Убрать задачу из всех списков (архив). */
export const removeTaskEverywhere = (queryClient: QueryClient, key: string): void => {
  queryClient.setQueriesData<TaskListResponse>({ queryKey: LISTS_PREFIX }, (current) => {
    if (!current) return current;
    const items = current.data.items.filter((task) => task.key !== key);
    return { ...current, data: { ...current.data, items, total: current.data.total - (current.data.items.length - items.length) } };
  });
};

/** После изменения — перечитать всё, что от задач зависит. */
export const refreshTaskViews = (queryClient: QueryClient, key?: string): void => {
  void queryClient.invalidateQueries({ queryKey: LISTS_PREFIX });
  void queryClient.invalidateQueries({ queryKey: getGetOverviewQueryKey() });
  void queryClient.invalidateQueries({ queryKey: getGetActivityFeedQueryKey() });
  void queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
  if (key) {
    void queryClient.invalidateQueries({ queryKey: getGetTaskQueryKey(key) });
    void queryClient.invalidateQueries({ queryKey: [`/tasks/${key}/activity`] });
  }
};
