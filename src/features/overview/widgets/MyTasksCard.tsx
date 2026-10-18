import { CircleCheckBig } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { Task } from '@/api/models';
import { PATHS } from '@/app/paths';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/common/EmptyState';
import { TaskRow } from '@/features/tasks/components/TaskRow';
import { useTaskRowContext } from '@/features/tasks/hooks/useTaskRowContext';

/** Мои ближайшие задачи — первым делом на телефоне. */
export const MyTasksCard = ({ tasks }: { tasks: Task[] }) => {
  const context = useTaskRowContext();
  return (
    <Card
      title="Мои задачи"
      action={<Link to={PATHS.myTasks} className="text-[13px] font-bold text-brand-800">Все</Link>}
      bodyClassName="-mx-3"
    >
      {tasks.length ? (
        <div className="flex flex-col divide-y divide-black/[0.04]">
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} context={context} showProject />
          ))}
        </div>
      ) : (
        <EmptyState icon={CircleCheckBig} title="Всё сделано" description="Открытых задач на вас нет." className="py-8" />
      )}
    </Card>
  );
};
