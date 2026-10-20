import type { JournalReviewDay } from '@/api/models';
import { Card } from '@/components/common/Card';
import { formatLongDate } from '@/lib/dates';
import { formatMinutes } from '../lib/journalMeta';

/** Работа по дням (UTC): высота — часы через агентов, подпись — число работ. */
export const DaysCard = ({ days }: { days: JournalReviewDay[] }) => {
  const max = Math.max(1, ...days.map((day) => day.activeMinutes));
  return (
    <Card title="По дням" className="h-full">
      <div className="flex h-40 items-end gap-1">
        {days.map((day) => (
          <div key={day.date} className="group relative flex h-full flex-1 flex-col justify-end" title={`${formatLongDate(day.date)}: ${day.sessions} работ, ${formatMinutes(day.activeMinutes)}`}>
            <div
              className={day.sessions ? 'rounded-t-lg bg-brand-500 transition-colors group-hover:bg-brand-700' : 'rounded-t-lg bg-black/[0.06]'}
              style={{ height: `${Math.max(day.sessions ? 6 : 3, (day.activeMinutes / max) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] font-semibold text-ink-faint">
        <span>{days[0] ? formatLongDate(days[0].date) : ''}</span>
        <span>{days.length ? formatLongDate(days[days.length - 1]!.date) : ''}</span>
      </div>
    </Card>
  );
};
