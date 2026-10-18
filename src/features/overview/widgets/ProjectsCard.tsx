import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { OverviewProjectProgress, Project } from '@/api/models';
import { PATHS } from '@/app/paths';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/ui/button';
import { ProjectBadge } from '@/features/tasks/components/ProjectBadge';
import { useSession } from '@/hooks/useSession';

interface IProjectsCardProps {
  projects: Project[];
  progress: OverviewProjectProgress[];
}

/** Проекты с прогрессом «закрыто из всего» — как список «Project» в референсе. */
export const ProjectsCard = ({ projects, progress }: IProjectsCardProps) => {
  const { isAdmin } = useSession();
  const byProject = new Map(progress.map((item) => [item.projectId, item]));

  return (
    <Card
      title="Проекты"
      action={
        isAdmin ? (
          <Button variant="outline" size="sm" asChild>
            <Link to={`${PATHS.settings}#projects`}>
              <Plus /> Новый
            </Link>
          </Button>
        ) : undefined
      }
    >
      <ul className="flex flex-col gap-3.5">
        {projects.map((project) => {
          const stats = byProject.get(project.id);
          const total = stats?.total ?? 0;
          const done = stats?.done ?? 0;
          const percent = total ? Math.round((done / total) * 100) : 0;
          return (
            <li key={project.id}>
              <Link to={`${PATHS.tasks}?project=${project.id}`} className="group flex items-center gap-3">
                <ProjectBadge project={project} className="h-9 w-9 rounded-xl text-[16px]" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-semibold text-ink group-hover:text-brand-800">{project.name}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full" style={{ width: `${percent}%`, background: project.color }} />
                    </div>
                    <span className="text-[11.5px] font-semibold text-ink-faint tabular">
                      {done}/{total}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
        {!projects.length && <li className="text-[14px] text-ink-faint">Проектов пока нет</li>}
      </ul>
    </Card>
  );
};
