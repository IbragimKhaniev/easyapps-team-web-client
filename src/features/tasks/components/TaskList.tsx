import { ChevronRight, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import { TaskStatus, type Task } from '@/api/models';
import { uiActions } from '@/app/uiStore';
import { STATUS_META, STATUS_ORDER } from '@/lib/tracker';
import { cn } from '@/lib/utils';
import { StatusIcon } from './StatusIcon';
import { TaskRow, type ITaskRowContext } from './TaskRow';

interface ITaskListProps {
  tasks: Task[];
  context: ITaskRowContext;
  showProject?: boolean;
  /** Проект для «+» в группе — новая задача сразу в нём и в этом статусе. */
  projectId?: string;
}

/** Отменённые свёрнуты сразу: их редко открывают. */
const COLLAPSED_BY_DEFAULT = new Set<TaskStatus>([TaskStatus.canceled]);

/** Список задач, сгруппированный по статусам, — как список в Linear. */
export const TaskList = ({ tasks, context, showProject = false, projectId }: ITaskListProps) => {
  const [collapsed, setCollapsed] = useState<Set<TaskStatus>>(COLLAPSED_BY_DEFAULT);

  const groups = useMemo(
    () =>
      STATUS_ORDER.map((status) => ({
        status,
        tasks: tasks.filter((task) => task.status === status).sort((a, b) => (a.rank < b.rank ? -1 : a.rank > b.rank ? 1 : 0)),
      })).filter((group) => group.tasks.length > 0),
    [tasks],
  );

  const toggle = (status: TaskStatus) =>
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });

  return (
    <div className="flex flex-col gap-3">
      {groups.map((group) => {
        const isCollapsed = collapsed.has(group.status);
        return (
          <section key={group.status} className={cn('overflow-hidden', context.isDesktop ? 'rounded-2xl bg-white/60 p-1.5' : 'card-surface')}>
            <header className="flex items-center gap-2 px-3 py-2">
              <button type="button" onClick={() => toggle(group.status)} className="flex flex-1 items-center gap-2 text-left">
                <ChevronRight className={cn('h-4 w-4 text-ink-faint transition-transform', !isCollapsed && 'rotate-90')} />
                <StatusIcon status={group.status} />
                <span className="text-[14px] font-bold text-ink">{STATUS_META[group.status].label}</span>
                <span className="text-[13px] font-semibold text-ink-faint tabular">{group.tasks.length}</span>
              </button>
              <button
                type="button"
                onClick={() => uiActions.openQuickAdd({ status: group.status, projectId })}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-black/[0.05] hover:text-ink"
                aria-label="Добавить задачу в группу"
              >
                <Plus className="h-4 w-4" />
              </button>
            </header>
            {!isCollapsed && (
              <div className={cn(!context.isDesktop && 'divide-y divide-black/[0.05]')}>
                {group.tasks.map((task) => (
                  <TaskRow key={task.id} task={task} context={context} showProject={showProject} />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};
