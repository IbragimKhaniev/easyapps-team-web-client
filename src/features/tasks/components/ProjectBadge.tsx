import type { Project } from '@/api/models';
import { cn } from '@/lib/utils';

/** Квадратик проекта: эмодзи на цветном фоне (или первая буква ключа). */
export const ProjectBadge = ({ project, className }: { project: Pick<Project, 'icon' | 'color' | 'key'>; className?: string }) => (
  <span
    className={cn('inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[13px] font-bold', className)}
    style={{ background: `${project.color}22`, color: project.color }}
  >
    {project.icon || project.key[0]}
  </span>
);
