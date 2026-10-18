import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';

import type { Task, TaskStatus } from '@/api/models';
import { useLabels, useMembers, useProjects } from '@/hooks/useDirectory';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { todayIso } from '@/lib/dates';
import type { ITaskRowContext } from '../components/TaskRow';
import { useTaskActions } from './useTaskActions';
import { useTaskParam } from './useTaskParam';

/**
 * Всё, что нужно строке и карточке задачи, одним объектом: справочники,
 * сегодняшняя дата и действия (статус, архив с «Отменить», открыть).
 */
export const useTaskRowContext = (): ITaskRowContext => {
  const { map: members } = useMembers();
  const { map: labels } = useLabels();
  const { map: projects } = useProjects();
  const isDesktop = useIsDesktop();
  const { openTask } = useTaskParam();
  const { updateTask, archiveTask, restoreTask } = useTaskActions();
  const today = todayIso();

  const onStatus = useCallback(
    (task: Task, status: TaskStatus) => {
      if (task.status !== status) void updateTask(task.key, { status });
    },
    [updateTask],
  );

  const onArchive = useCallback(
    async (task: Task) => {
      if (!(await archiveTask(task.key))) return;
      toast(`${task.key} в архиве`, {
        action: { label: 'Отменить', onClick: () => void restoreTask(task.key) },
      });
    },
    [archiveTask, restoreTask],
  );

  return useMemo(
    () => ({ today, members, labels, projects, isDesktop, onOpen: openTask, onStatus, onArchive }),
    [today, members, labels, projects, isDesktop, openTask, onStatus, onArchive],
  );
};
