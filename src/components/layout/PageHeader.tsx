import { ChevronLeft } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { useIsDesktop } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

interface IPageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  /** Кнопки справа (на телефоне — компактные). */
  actions?: ReactNode;
  /** Кнопка «назад» на телефоне (во вложенных экранах). */
  backTo?: string;
  /** Под заголовком: сегменты, фильтры. */
  children?: ReactNode;
}

/**
 * Заголовок экрана. Компьютер — крупный заголовок с подписью и кнопками, как
 * «Dashboard» в референсе. Телефон — крупный заголовок iOS (34 pt), который
 * при прокрутке уходит, а сверху проявляется компактная стеклянная шапка.
 */
export const PageHeader = ({ title, subtitle, actions, backTo, children }: IPageHeaderProps) => {
  const isDesktop = useIsDesktop();
  const sentinel = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isDesktop || !sentinel.current) return;
    const observer = new IntersectionObserver(([entry]) => setCollapsed(!entry.isIntersecting), {
      rootMargin: '-56px 0px 0px 0px',
    });
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [isDesktop]);

  if (isDesktop) {
    return (
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-title text-ink">{title}</h1>
            {subtitle && <p className="mt-2 text-[15px] text-ink-muted">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
        {children}
      </div>
    );
  }

  const back = backTo && (
    <button
      type="button"
      onClick={() => navigate(backTo)}
      className="-ml-2 inline-flex h-9 items-center text-[17px] font-medium text-brand-800"
    >
      <ChevronLeft className="h-6 w-6" /> Назад
    </button>
  );

  return (
    <>
      {/* Компактная шапка — появляется, когда крупный заголовок уехал вверх */}
      <div
        className={cn(
          'glass fixed inset-x-0 top-0 z-30 border-b border-black/[0.05] pt-safe transition-opacity duration-200',
          collapsed ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <div className="flex h-11 items-center justify-between gap-2 px-4">
          <div className="w-20">{back}</div>
          <span className="truncate text-[17px] font-bold text-ink">{title}</span>
          <div className="flex w-20 justify-end">{actions}</div>
        </div>
      </div>

      <div className="px-4 pt-safe">
        <div className="flex h-11 items-center justify-between">
          <div>{back}</div>
          <div className="flex items-center gap-2">{actions}</div>
        </div>
        <h1 className="text-[34px] font-extrabold leading-[1.1] tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-[15px] text-ink-muted">{subtitle}</p>}
        <div ref={sentinel} className="h-px" />
        {children && <div className="mt-4">{children}</div>}
      </div>
    </>
  );
};
