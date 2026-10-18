import { NavLink } from 'react-router-dom';

import { MEDIA_TABS } from '@/app/navigation';
import { cn } from '@/lib/utils';

/** Разделы медиа на телефоне — капсулы под заголовком (в таббаре у медиа одна вкладка). */
export const MediaSectionTabs = () => (
  <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none lg:hidden">
    {MEDIA_TABS.map((tab) => (
      <NavLink
        key={tab.to}
        to={tab.to}
        className={({ isActive }) =>
          cn(
            'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-[14px] font-bold transition-colors [&_svg]:h-4 [&_svg]:w-4',
            isActive ? 'bg-ink text-white' : 'bg-white text-ink-soft shadow-card',
          )
        }
      >
        <tab.icon /> {tab.label}
      </NavLink>
    ))}
  </nav>
);
