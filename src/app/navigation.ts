import {
  BarChart3,
  Bot,
  CalendarDays,
  CircleCheckBig,
  Images,
  LayoutGrid,
  ListTodo,
  Newspaper,
  NotebookPen,
  Scale,
  Settings,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react';

import { PATHS } from './paths';

export interface INavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Активна только на точном адресе (для «/»). */
  end?: boolean;
  /** Счётчик рядом с пунктом. */
  badge?: 'myOpenTasks';
}

export interface INavSection {
  title: string;
  items: INavItem[];
}

/** Сайдбар компьютера: разделы как в референсе (MENU / GENERAL). */
export const NAV_SECTIONS: INavSection[] = [
  {
    title: 'Меню',
    items: [
      { to: PATHS.overview, label: 'Сводка', icon: LayoutGrid, end: true },
      { to: PATHS.myTasks, label: 'Мои задачи', icon: CircleCheckBig, badge: 'myOpenTasks' },
      { to: PATHS.tasks, label: 'Задачи', icon: ListTodo },
    ],
  },
  {
    title: 'Медиа',
    items: [
      { to: PATHS.media.plan, label: 'Контент-план', icon: CalendarDays },
      { to: PATHS.media.library, label: 'Медиатека', icon: Images },
      { to: PATHS.media.feed, label: 'Лента', icon: Newspaper },
      { to: PATHS.media.analytics, label: 'Аналитика', icon: BarChart3 },
    ],
  },
  {
    title: 'Агенты',
    items: [
      { to: PATHS.journal, label: 'Журнал работы', icon: NotebookPen, end: true },
      { to: PATHS.journalReview, label: 'Разбор', icon: Scale },
      { to: PATHS.agents, label: 'Подключить агента', icon: Bot },
    ],
  },
  {
    title: 'Общее',
    items: [
      { to: PATHS.media.settings, label: 'Площадки', icon: SlidersHorizontal },
      { to: PATHS.settings, label: 'Настройки', icon: Settings },
    ],
  },
];

/** Таббар телефона: четыре вкладки и «+» по центру. */
export const TAB_ITEMS: INavItem[] = [
  { to: PATHS.overview, label: 'Сводка', icon: LayoutGrid, end: true },
  { to: PATHS.tasks, label: 'Задачи', icon: ListTodo },
  { to: PATHS.media.plan, label: 'Медиа', icon: CalendarDays },
  { to: PATHS.more, label: 'Ещё', icon: SlidersHorizontal },
];

/** Разделы медиа — переключатель вверху экрана на телефоне. */
export const MEDIA_TABS: INavItem[] = [
  { to: PATHS.media.plan, label: 'План', icon: CalendarDays },
  { to: PATHS.media.library, label: 'Медиатека', icon: Images },
  { to: PATHS.media.feed, label: 'Лента', icon: Newspaper },
  { to: PATHS.media.analytics, label: 'Аналитика', icon: BarChart3 },
];
