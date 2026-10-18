import { ArrowUpRight, PartyPopper } from 'lucide-react';

import type { Task } from '@/api/models';
import { uiActions } from '@/app/uiStore';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/ui/button';
import { useTaskParam } from '@/features/tasks/hooks/useTaskParam';
import { dueLabel, formatLongDate } from '@/lib/dates';
import { STATUS_META } from '@/lib/tracker';

/** «Ближайшее» — моя задача с самым близким сроком (как «Reminders» в референсе). */
export const NextUpCard = ({ tasks, today }: { tasks: Task[]; today: string }) => {
  const { openTask } = useTaskParam();
  const next = tasks.find((task) => task.dueDate) ?? tasks[0];

  if (!next) {
    return (
      <Card title="Ближайшее">
        <div className="flex h-full flex-col justify-between gap-4">
          <div>
            <PartyPopper className="h-7 w-7 text-brand-700" />
            <p className="mt-3 text-[22px] font-bold leading-tight text-ink">У вас нет открытых задач</p>
            <p className="mt-1 text-[14px] text-ink-muted">Возьмите задачу из общего списка или заведите новую.</p>
          </div>
          <Button onClick={() => uiActions.openQuickAdd()} className="w-full">Новая задача</Button>
        </div>
      </Card>
    );
  }

  const due = next.dueDate ? dueLabel(next.dueDate, today) : null;

  return (
    <Card title="Ближайшее">
      <div className="flex h-full flex-col justify-between gap-5">
        <div>
          <p className="line-clamp-3 text-[24px] font-bold leading-tight tracking-tight text-brand-800">{next.title}</p>
          <p className="mt-2 text-[14px] text-ink-muted">
            {next.key} · {STATUS_META[next.status].label}
            {next.dueDate && ` · срок ${formatLongDate(next.dueDate)}`}
            {due?.tone === 'overdue' && <span className="font-bold text-rose-600"> — просрочено</span>}
          </p>
        </div>
        <Button size="lg" onClick={() => openTask(next.key)} className="w-full">
          <ArrowUpRight />
          Открыть задачу
        </Button>
      </div>
    </Card>
  );
};
