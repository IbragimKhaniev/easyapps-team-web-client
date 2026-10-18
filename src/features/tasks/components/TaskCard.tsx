import { CheckSquare, MessageCircle } from 'lucide-react';
import { forwardRef, type HTMLAttributes } from 'react';

import type { Task } from '@/api/models';
import { MemberAvatar } from '@/components/common/MemberAvatar';
import { isOpenStatus } from '@/lib/tracker';
import { cn } from '@/lib/utils';
import { DueChip } from './DueChip';
import { LabelChips } from './LabelChips';
import { PriorityIcon } from './PriorityIcon';
import type { ITaskRowContext } from './TaskRow';

interface ITaskCardProps extends HTMLAttributes<HTMLDivElement> {
  task: Task;
  context: ITaskRowContext;
  /** Карточка «в руке» при переносе — приподнята и чуть повёрнута. */
  lifted?: boolean;
  /** Место, откуда карточку унесли, — пунктирная тень. */
  placeholder?: boolean;
}

/** Карточка доски: ровно столько, чтобы понять задачу, не открывая её. */
export const TaskCard = forwardRef<HTMLDivElement, ITaskCardProps>(
  ({ task, context, lifted = false, placeholder = false, className, ...props }, ref) => {
    const assignee = task.assigneeId ? context.members.get(task.assigneeId) : null;
    const project = context.projects.get(task.projectId);
    const closed = !isOpenStatus(task.status);

    if (placeholder) {
      return <div ref={ref} className="h-[104px] rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50/60" {...props} />;
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex cursor-grab touch-manipulation select-none flex-col gap-3 rounded-2xl bg-white p-3.5 shadow-card transition-shadow active:cursor-grabbing',
          lifted ? 'rotate-[2.5deg] shadow-float ring-1 ring-brand/30' : 'hover:shadow-float',
          className,
        )}
        {...props}
      >
        <div className="flex items-center gap-2 text-[11.5px] font-semibold text-ink-faint">
          {project && (
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: project.color }} title={project.name} />
          )}
          <span className="font-mono">{task.key}</span>
          <PriorityIcon priority={task.priority} className="ml-auto" />
        </div>

        <div className={cn('line-clamp-3 text-[14.5px] font-semibold leading-snug', closed ? 'text-ink-faint line-through' : 'text-ink')}>
          {task.title}
        </div>

        <LabelChips labelIds={task.labelIds} labels={context.labels} max={2} />

        <div className="flex items-center gap-2">
          {task.dueDate && <DueChip dueDate={task.dueDate} today={context.today} muted={closed} />}
          {task.checklistTotal > 0 && (
            <span className="flex items-center gap-1 text-[12px] font-semibold text-ink-muted tabular">
              <CheckSquare className="h-3.5 w-3.5" />
              {task.checklistDone}/{task.checklistTotal}
            </span>
          )}
          {task.commentsCount > 0 && (
            <span className="flex items-center gap-1 text-[12px] font-semibold text-ink-muted">
              <MessageCircle className="h-3.5 w-3.5" />
              {task.commentsCount}
            </span>
          )}
          <MemberAvatar member={assignee} size="xs" className="ml-auto" />
        </div>
      </div>
    );
  },
);
TaskCard.displayName = 'TaskCard';
