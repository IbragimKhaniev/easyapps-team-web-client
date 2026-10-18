import { CircleCheckBig, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useListTasks } from '@/api/generated/tasks/tasks';
import { TaskStatus } from '@/api/models';
import { uiActions } from '@/app/uiStore';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { useSession } from '@/hooks/useSession';
import { todayIso } from '@/lib/dates';
import { pluralize, TASK_FORMS } from '@/lib/plural';
import { OPEN_STATUSES } from '@/lib/tracker';
import { cn } from '@/lib/utils';
import { TaskRow } from '../components/TaskRow';
import { useTaskRowContext } from '../hooks/useTaskRowContext';
import { groupByDue } from '../lib/dueBuckets';

const RECENT_DONE_LIMIT = 20;

/** «Мои задачи»: что горит, что сегодня, что на неделе — и недавно закрытое. */
export const MyTasksPage = () => {
  const today = todayIso();
  const context = useTaskRowContext();
  const { user } = useSession();
  const [showDone, setShowDone] = useState(false);

  const open = useListTasks({ assignee: 'me', status: OPEN_STATUSES.join(','), sort: 'due', today, limit: 1000 });
  const done = useListTasks(
    { assignee: 'me', status: TaskStatus.done, sort: 'updated', limit: RECENT_DONE_LIMIT },
    { query: { enabled: showDone } },
  );

  const tasks = useMemo(() => open.data?.data.items ?? [], [open.data]);
  const buckets = useMemo(() => groupByDue(tasks, today), [tasks, today]);

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Мои задачи"
        subtitle={open.data ? `${pluralize(tasks.length, TASK_FORMS)} на вас` : undefined}
        actions={
          <Button size={context.isDesktop ? 'lg' : 'icon'} onClick={() => uiActions.openQuickAdd({ assigneeId: user?.id })} aria-label="Новая задача">
            <Plus />
            {context.isDesktop && 'Новая задача'}
          </Button>
        }
      />

      <div className={cn('flex flex-col gap-4', !context.isDesktop && 'px-4')}>
        {open.isLoading && <div className="skeleton h-48 rounded-card" />}

        {!open.isLoading && !tasks.length && (
          <div className="card-surface">
            <EmptyState icon={CircleCheckBig} title="Всё сделано" description="Открытых задач на вас нет — можно взять что-то из общего списка." />
          </div>
        )}

        {buckets.map((bucket) => (
          <section key={bucket.id} className={cn(context.isDesktop ? 'rounded-2xl bg-white/60 p-1.5' : 'card-surface overflow-hidden')}>
            <header className="flex items-center gap-2 px-3 py-2">
              <span className={cn('text-[14px] font-bold', bucket.id === 'overdue' ? 'text-rose-600' : 'text-ink')}>{bucket.title}</span>
              <span className="text-[13px] font-semibold text-ink-faint tabular">{bucket.tasks.length}</span>
            </header>
            <div className={cn(!context.isDesktop && 'divide-y divide-black/[0.05]')}>
              {bucket.tasks.map((task) => (
                <TaskRow key={task.id} task={task} context={context} showProject />
              ))}
            </div>
          </section>
        ))}

        <button
          type="button"
          onClick={() => setShowDone((value) => !value)}
          className="self-start rounded-full px-3 py-1.5 text-[13.5px] font-bold text-brand-800 hover:bg-white"
        >
          {showDone ? 'Скрыть закрытые' : 'Показать недавно закрытые'}
        </button>

        {showDone && (done.data?.data.items.length ?? 0) > 0 && (
          <section className={cn(context.isDesktop ? 'rounded-2xl bg-white/60 p-1.5' : 'card-surface overflow-hidden')}>
            <header className="px-3 py-2 text-[14px] font-bold text-ink-muted">Недавно закрытые</header>
            {done.data?.data.items.map((task) => (
              <TaskRow key={task.id} task={task} context={context} showProject />
            ))}
          </section>
        )}
      </div>
    </div>
  );
};
