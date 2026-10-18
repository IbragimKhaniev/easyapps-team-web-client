import { useListTasks } from '@/api/generated/tasks/tasks';
import { TaskStatus, type OverviewWorkload, type Task, type TeamMember } from '@/api/models';
import { Card } from '@/components/common/Card';
import { MemberAvatar } from '@/components/common/MemberAvatar';
import { useTaskParam } from '@/features/tasks/hooks/useTaskParam';
import { cn } from '@/lib/utils';

/** Больше стольких открытых задач на человека — «перегруз». */
const OVERLOAD_THRESHOLD = 12;

const chipOf = (load: OverviewWorkload | undefined) => {
  if (!load || load.open === 0) return { text: 'Свободен', className: 'border-brand-200 bg-brand-50 text-brand-800' };
  if (load.overdue > 0) return { text: `Просрочено: ${load.overdue}`, className: 'border-rose-200 bg-rose-50 text-rose-600' };
  if (load.open > OVERLOAD_THRESHOLD) return { text: 'Перегруз', className: 'border-amber-200 bg-amber-50 text-amber-700' };
  return { text: `${load.open} в работе`, className: 'border-black/10 bg-white text-ink-soft' };
};

interface ITeamCardProps {
  members: TeamMember[];
  workload: OverviewWorkload[];
}

/** Команда: над чем каждый работает прямо сейчас и сколько у него на руках (как «Team Collaboration»). */
export const TeamCard = ({ members, workload }: ITeamCardProps) => {
  const { openTask } = useTaskParam();
  const { data } = useListTasks({ status: TaskStatus.in_progress, sort: 'updated', limit: 200 });
  const loadByMember = new Map(workload.map((item) => [item.memberId, item]));
  const currentTask = new Map<string, Task>();
  for (const task of data?.data.items ?? []) {
    if (task.assigneeId && !currentTask.has(task.assigneeId)) currentTask.set(task.assigneeId, task);
  }

  return (
    <Card title="Команда">
      <ul className="flex flex-col gap-4">
        {members.map((member) => {
          const task = currentTask.get(member.id);
          const chip = chipOf(loadByMember.get(member.id));
          return (
            <li key={member.id} className="flex items-center gap-3">
              <MemberAvatar member={member} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-bold text-ink">{member.name}</div>
                {task ? (
                  <button type="button" onClick={() => openTask(task.key)} className="block max-w-full truncate text-left text-[13px] text-ink-muted hover:text-ink">
                    Работает над: <span className="font-semibold text-ink-soft">{task.title}</span>
                  </button>
                ) : (
                  <div className="text-[13px] text-ink-faint">Сейчас ничего не в работе</div>
                )}
              </div>
              <span className={cn('shrink-0 rounded-md border px-2 py-0.5 text-[11.5px] font-bold', chip.className)}>{chip.text}</span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
};
