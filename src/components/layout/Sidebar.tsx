import { LogOut, Smartphone } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { NAV_SECTIONS, type INavItem } from '@/app/navigation';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui/button';
import { useMyOpenTasksCount } from '@/features/tasks/hooks/useMyOpenTasksCount';
import { useLogoutAction } from '@/features/auth/useLogoutAction';
import { cn } from '@/lib/utils';
import { InstallHintDialog } from './InstallHintDialog';

const NavItem = ({ item, badge }: { item: INavItem; badge?: number }) => (
  <NavLink
    to={item.to}
    end={item.end}
    className={({ isActive }) =>
      cn(
        'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] transition-colors',
        isActive ? 'font-bold text-ink' : 'font-medium text-ink-muted hover:bg-white/70 hover:text-ink',
      )
    }
  >
    {({ isActive }) => (
      <>
        {/* Полоса слева у активного пункта — как в референсе */}
        <span
          className={cn(
            'absolute -left-5 top-1/2 h-8 w-1.5 -translate-y-1/2 rounded-r-full bg-brand-800 transition-opacity',
            isActive ? 'opacity-100' : 'opacity-0',
          )}
          aria-hidden
        />
        <item.icon className={cn('h-5 w-5 shrink-0', isActive ? 'text-brand-800' : 'text-ink-faint group-hover:text-ink-muted')} />
        <span className="truncate">{item.label}</span>
        {badge !== undefined && badge > 0 && (
          <span className="ml-auto rounded-full bg-brand-800 px-2 py-0.5 text-[11px] font-bold text-white tabular">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </>
    )}
  </NavLink>
);

/** Сайдбар компьютера: логотип, разделы, подсказка про iPhone и выход. */
export const Sidebar = () => {
  const myOpen = useMyOpenTasksCount();
  const logout = useLogoutAction();

  return (
    <aside className="flex h-full w-[264px] shrink-0 flex-col rounded-card bg-panel px-5 pb-5 pt-6">
      <Logo className="px-1" />

      <nav className="mt-9 flex flex-1 flex-col gap-7 overflow-y-auto scrollbar-none">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="mb-2 px-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
              {section.title}
            </div>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <NavItem key={item.to} item={item} badge={item.badge === 'myOpenTasks' ? myOpen : undefined} />
              ))}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={logout}
          className="-mt-5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-ink-muted transition-colors hover:bg-white/70 hover:text-ink"
        >
          <LogOut className="h-5 w-5 text-ink-faint" />
          Выйти
        </button>
      </nav>

      {/* Тёмная плитка внизу — как «Download our Mobile App» в референсе */}
      <div className="tile-deep mt-4 rounded-2xl p-4">
        <Smartphone className="h-6 w-6 text-brand-300" />
        <div className="mt-3 text-[17px] font-bold leading-tight">team на iPhone</div>
        <p className="mt-1 text-xs leading-relaxed text-white/70">Как приложение: с иконкой и без адресной строки</p>
        <InstallHintDialog
          trigger={
            <Button variant="brand" size="sm" className="mt-3 w-full">
              Как установить
            </Button>
          }
        />
      </div>
    </aside>
  );
};
