import { MessageCircle } from 'lucide-react';
import { memo } from 'react';

import { TaskStatus, type Label, type Project, type Task, type TeamMember } from '@/api/models';
import { MemberAvatar } from '@/components/common/MemberAvatar';
import { isOpenStatus } from '@/lib/tracker';
import { cn } from '@/lib/utils';
import { StatusPicker } from '../pickers/StatusPicker';
import { DueChip } from './DueChip';
import { LabelChips } from './LabelChips';
import { PriorityIcon } from './PriorityIcon';
import { StatusIcon } from './StatusIcon';
import { SwipeableRow } from './SwipeableRow';

export interface ITaskRowContext {
  today: string;
  members: Map<string, TeamMember>;
  labels: Map<string, Label>;
  projects: Map<string, Project>;
  isDesktop: boolean;
  onOpen: (key: string) => void;
  onStatus: (task: Task, status: TaskStatus) => void;
  onArchive: (task: Task) => void;
}

interface ITaskRowProps {
  task: Task;
  context: ITaskRowContext;
  /** Показывать проект (на «Моих задачах» задачи из разных проектов). */
  showProject?: boolean;
}

const statusButtonClass = 'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-black/[0.05]';

/** Строка задачи: на компьютере — плотная, как в Linear; на телефоне — крупнее и со свайпами. */
export const TaskRow = memo(({ task, context, showProject = false }: ITaskRowProps) => {
  const { today, members, labels, projects, isDesktop, onOpen, onStatus, onArchive } = context;
  const assignee = task.assigneeId ? members.get(task.assigneeId) : null;
  const project = projects.get(task.projectId);
  const closed = !isOpenStatus(task.status);

  if (isDesktop) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpen(task.key)}
        onKeyDown={(event) => event.key === 'Enter' && onOpen(task.key)}
        className="group flex h-12 cursor-pointer items-center gap-3 rounded-xl px-3 transition-colors hover:bg-white focus-visible:bg-white focus-visible:outline-none"
      >
        <span onClick={(event) => event.stopPropagation()}>
          <StatusPicker
            value={task.status}
            onChange={(status) => onStatus(task, status)}
            trigger={<button type="button" className={statusButtonClass} aria-label="Статус"><StatusIcon status={task.status} /></button>}
          />
        </span>
        <PriorityIcon priority={task.priority} />
        <span className="w-16 shrink-0 font-mono text-[12px] text-ink-faint">{task.key}</span>
        <span className={cn('min-w-0 flex-1 truncate text-[14.5px] font-semibold', closed ? 'text-ink-faint line-through decoration-ink-faint/60' : 'text-ink')}>
          {task.title}
        </span>
        <LabelChips labelIds={task.labelIds} labels={labels} max={2} className="hidden xl:flex" />
        {showProject && project && (
          <span className="hidden max-w-[140px] truncate text-[12px] font-semibold text-ink-muted lg:block">{project.name}</span>
        )}
        {task.commentsCount > 0 && (
          <span className="flex items-center gap-1 text-[12px] font-semibold text-ink-faint">
            <MessageCircle className="h-3.5 w-3.5" />
            {task.commentsCount}
          </span>
        )}
        {task.dueDate && <DueChip dueDate={task.dueDate} today={today} muted={closed} />}
        <MemberAvatar member={assignee} size="xs" />
      </div>
    );
  }

  return (
    <SwipeableRow
      onSwipeRight={closed ? undefined : () => onStatus(task, TaskStatus.done)}
      onSwipeLeft={() => onArchive(task)}
    >
      <div className="flex min-h-[60px] items-center gap-3 px-4 py-2.5 active:bg-black/[0.03]" onClick={() => onOpen(task.key)}>
        <button
          type="button"
          className={statusButtonClass}
          aria-label={closed ? 'Вернуть в работу' : 'Готово'}
          onClick={(event) => {
            event.stopPropagation();
            onStatus(task, closed ? TaskStatus.todo : TaskStatus.done);
          }}
        >
          <StatusIcon status={task.status} className="h-[22px] w-[22px]" />
        </button>
        <div className="min-w-0 flex-1">
          <div className={cn('line-clamp-2 text-[16px] font-semibold leading-snug', closed ? 'text-ink-faint line-through' : 'text-ink')}>
            {task.title}
          </div>
          <div className="mt-1 flex min-w-0 items-center gap-2 text-[12.5px] text-ink-muted">
            <span className="shrink-0 whitespace-nowrap font-mono">{task.key}</span>
            {task.dueDate && <DueChip dueDate={task.dueDate} today={today} muted={closed} className="py-0 text-[11.5px]" />}
            {task.priority !== 'none' && <PriorityIcon priority={task.priority} />}
            <LabelChips labelIds={task.labelIds} labels={labels} compact />
            {showProject && project && <span className="min-w-0 truncate">{project.name}</span>}
          </div>
        </div>
        {assignee && <MemberAvatar member={assignee} size="sm" />}
      </div>
    </SwipeableRow>
  );
});
TaskRow.displayName = 'TaskRow';
