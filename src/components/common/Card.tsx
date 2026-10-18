import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface ICardProps {
  title?: ReactNode;
  /** Кнопка или ссылка справа от заголовка («+ Новая», «Все»). */
  action?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

/** Белая карточка с заголовком — основной блок экранов (как «Reminders» и «Project» в референсе). */
export const Card = ({ title, action, className, bodyClassName, children }: ICardProps) => (
  <section className={cn('card-surface flex flex-col p-5', className)}>
    {(title || action) && (
      <header className="mb-4 flex items-center justify-between gap-3">
        {title && <h2 className="text-[17px] font-bold tracking-tight text-ink">{title}</h2>}
        {action}
      </header>
    )}
    <div className={cn('flex-1', bodyClassName)}>{children}</div>
  </section>
);
