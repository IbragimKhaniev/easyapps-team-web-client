import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { toast } from 'sonner';

import {
  useArchiveTask,
  useCreateTask,
  useMoveTask,
  useRestoreTask,
  useUpdateTask,
} from '@/api/generated/tasks/tasks';
import type { CreateTaskBody, MoveTaskBody, Task, TaskDetail, UpdateTaskBody } from '@/api/models';
import { apiErrorMessage } from '@/lib/errors';
import {
  cancelTaskQueries,
  patchTaskEverywhere,
  refreshTaskViews,
  removeTaskEverywhere,
  restoreSnapshot,
  snapshotTasks,
} from '../lib/cache';

/** Поля правки, которые совпадают с полями задачи — их можно показать сразу. */
const optimisticPatch = (body: UpdateTaskBody): Partial<Task> => {
  const patch: Partial<Task> = {};
  if (body.title !== undefined) patch.title = body.title;
  if (body.status !== undefined) patch.status = body.status;
  if (body.priority !== undefined) patch.priority = body.priority;
  if (body.assigneeId !== undefined) patch.assigneeId = body.assigneeId;
  if (body.labelIds !== undefined) patch.labelIds = body.labelIds;
  if (body.dueDate !== undefined) patch.dueDate = body.dueDate;
  return patch;
};

/**
 * Действия с задачами для любого экрана: правка, перенос, создание, архив.
 * Изменение видно сразу (оптимистично), ошибка откатывает его и показывает тост.
 */
export const useTaskActions = () => {
  const queryClient = useQueryClient();
  const update = useUpdateTask();
  const move = useMoveTask();
  const create = useCreateTask();
  const archive = useArchiveTask();
  const restore = useRestoreTask();

  const updateTask = useCallback(
    async (key: string, body: UpdateTaskBody): Promise<TaskDetail | undefined> => {
      await cancelTaskQueries(queryClient, key);
      const snapshot = snapshotTasks(queryClient, key);
      patchTaskEverywhere(queryClient, key, optimisticPatch(body));
      try {
        const result = await update.mutateAsync({ key, data: body });
        patchTaskEverywhere(queryClient, key, result.data);
        return result.data;
      } catch (error) {
        restoreSnapshot(queryClient, snapshot);
        toast.error(apiErrorMessage(error, 'Не удалось сохранить задачу'));
        return undefined;
      } finally {
        refreshTaskViews(queryClient, key);
      }
    },
    [queryClient, update],
  );

  /** Перенос на доске; `rank` — посчитанный на клиенте, чтобы карточка встала сразу. */
  const moveTask = useCallback(
    async (key: string, body: MoveTaskBody, optimisticRank: string): Promise<void> => {
      await cancelTaskQueries(queryClient, key);
      const snapshot = snapshotTasks(queryClient, key);
      patchTaskEverywhere(queryClient, key, { status: body.status, rank: optimisticRank });
      try {
        const result = await move.mutateAsync({ key, data: body });
        patchTaskEverywhere(queryClient, key, result.data);
      } catch (error) {
        restoreSnapshot(queryClient, snapshot);
        toast.error(apiErrorMessage(error, 'Не удалось перенести задачу'));
      } finally {
        refreshTaskViews(queryClient, key);
      }
    },
    [queryClient, move],
  );

  const createTask = useCallback(
    async (body: CreateTaskBody): Promise<TaskDetail | undefined> => {
      try {
        const result = await create.mutateAsync({ data: body });
        return result.data;
      } catch (error) {
        toast.error(apiErrorMessage(error, 'Не удалось создать задачу'));
        return undefined;
      } finally {
        refreshTaskViews(queryClient);
      }
    },
    [queryClient, create],
  );

  const archiveTask = useCallback(
    async (key: string): Promise<boolean> => {
      await cancelTaskQueries(queryClient, key);
      const snapshot = snapshotTasks(queryClient, key);
      removeTaskEverywhere(queryClient, key);
      try {
        await archive.mutateAsync({ key });
        return true;
      } catch (error) {
        restoreSnapshot(queryClient, snapshot);
        toast.error(apiErrorMessage(error, 'Не удалось убрать задачу в архив'));
        return false;
      } finally {
        refreshTaskViews(queryClient, key);
      }
    },
    [queryClient, archive],
  );

  const restoreTask = useCallback(
    async (key: string): Promise<boolean> => {
      try {
        await restore.mutateAsync({ key });
        return true;
      } catch (error) {
        toast.error(apiErrorMessage(error, 'Не удалось вернуть задачу'));
        return false;
      } finally {
        refreshTaskViews(queryClient, key);
      }
    },
    [queryClient, restore],
  );

  return { updateTask, moveTask, createTask, archiveTask, restoreTask, isCreating: create.isPending };
};
