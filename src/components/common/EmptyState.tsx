import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface IEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/** Пустой экран учит, а не пустует: что здесь будет и как начать. */
export const EmptyState = ({ icon: Icon, title, description, action, className }: IEmptyStateProps) => (
  <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
    <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-800">
      <Icon className="h-7 w-7" />
    </span>
    <h3 className="text-[17px] font-bold text-ink">{title}</h3>
    {description && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-muted">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);
