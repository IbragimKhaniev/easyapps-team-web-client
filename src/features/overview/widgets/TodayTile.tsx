import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { PATHS } from '@/app/paths';
import { pluralize, TASK_FORMS } from '@/lib/plural';

interface ITodayTileProps {
  dueToday: number;
  overdue: number;
}

/** Тёмная плитка «Сегодня» — как «Time Tracker» в референсе: одна крупная цифра и действие. */
export const TodayTile = ({ dueToday, overdue }: ITodayTileProps) => (
  <section className="tile-deep flex min-h-[200px] flex-col justify-between rounded-card p-5">
    <div className="text-[17px] font-bold">Сегодня</div>
    <div>
      <div className="text-[56px] font-extrabold leading-none tracking-tight tabular">{dueToday}</div>
      <div className="mt-1 text-[14px] text-white/75">
        {dueToday === 0 ? 'на сегодня сроков нет' : `${pluralize(dueToday, TASK_FORMS)} со сроком сегодня`}
        {overdue > 0 && <span className="font-bold text-rose-300"> · просрочено {overdue}</span>}
      </div>
    </div>
    <Link
      to={`${PATHS.myTasks}`}
      className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-full bg-white px-5 text-[14px] font-bold text-brand-950 transition-transform active:scale-95"
    >
      Мой день <ArrowRight className="h-4 w-4" />
    </Link>
  </section>
);
