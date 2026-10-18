import { Plus } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { TAB_ITEMS, type INavItem } from '@/app/navigation';
import { uiActions } from '@/app/uiStore';
import { cn } from '@/lib/utils';

const Tab = ({ item }: { item: INavItem }) => (
  <NavLink
    to={item.to}
    end={item.end}
    className={({ isActive }) =>
      cn(
        'flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-1.5 text-[10.5px] font-semibold transition-colors',
        isActive ? 'text-brand-800' : 'text-ink-faint active:text-ink-muted',
      )
    }
  >
    {({ isActive }) => (
      <>
        <span className={cn('flex h-7 w-12 items-center justify-center rounded-full transition-colors', isActive && 'bg-brand-50')}>
          <item.icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.4 : 2} />
        </span>
        {item.label}
      </>
    )}
  </NavLink>
);

/**
 * Таббар телефона: плавающая стеклянная капсула над индикатором «Домой»
 * (как в iOS 26), «+» по центру — быстрое добавление задачи.
 */
export const MobileTabBar = () => {
  const [first, second, third, fourth] = TAB_ITEMS;
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 px-3"
      style={{ paddingBottom: 'max(var(--safe-bottom), 10px)' }}
      aria-label="Разделы"
    >
      <div className="glass mx-auto flex h-[var(--tabbar-height)] max-w-md items-center gap-1 rounded-[30px] border border-black/[0.06] px-2 shadow-float">
        <Tab item={first} />
        <Tab item={second} />
        <button
          type="button"
          onClick={() => uiActions.openQuickAdd()}
          className="mx-1 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-lift transition-transform active:scale-90"
          aria-label="Новая задача"
        >
          <Plus className="h-6 w-6" strokeWidth={2.6} />
        </button>
        <Tab item={third} />
        <Tab item={fourth} />
      </div>
    </nav>
  );
};
