import type { MediaPost } from '@/api/models';
import { cn } from '@/lib/utils';
import { WEEKDAY_SHORT, type ICalendarDay } from '../../lib/calendar';
import { POST_STATUS_META, TONE_DOT } from '../../lib/status';

interface ICompactMonthProps {
  weeks: ICalendarDay[][];
  postsOf: (day: ICalendarDay) => MediaPost[];
  selected: string;
  onSelect: (iso: string) => void;
}

/** Точек под числом — не больше, чтобы клетка не расползалась. */
const DOTS_MAX = 3;

/** Месяц на телефоне — как «Календарь» iOS: числа и точки постов, выбранный день — кружком. */
export const CompactMonth = ({ weeks, postsOf, selected, onSelect }: ICompactMonthProps) => (
  <div className="grid grid-cols-7 gap-y-1">
    {WEEKDAY_SHORT.map((weekday, index) => (
      <div key={weekday} className={cn('pb-1 text-center text-[11px] font-bold uppercase', index > 4 ? 'text-ink-faint' : 'text-ink-muted')}>
        {weekday}
      </div>
    ))}
    {weeks.flat().map((day) => {
      const posts = postsOf(day);
      const isSelected = day.iso === selected;
      return (
        <button key={day.iso} type="button" onClick={() => onSelect(day.iso)} className="flex h-12 flex-col items-center justify-start gap-1 pt-1">
          <span
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-full text-[16px] font-semibold tabular transition-colors',
              isSelected ? (day.isToday ? 'bg-brand-600 text-white' : 'bg-ink text-white') : day.isToday ? 'text-brand-700' : day.inMonth ? 'text-ink' : 'text-ink-faint',
            )}
          >
            {day.day}
          </span>
          <span className="flex h-1.5 gap-0.5">
            {posts.slice(0, DOTS_MAX).map((post) => (
              <span key={post.id} className={cn('h-1.5 w-1.5 rounded-full', TONE_DOT[POST_STATUS_META[post.status].tone])} />
            ))}
          </span>
        </button>
      );
    })}
  </div>
);
