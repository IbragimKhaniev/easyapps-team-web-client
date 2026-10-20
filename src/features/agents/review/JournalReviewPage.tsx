import { CircleHelp, NotebookPen, Sparkles, TriangleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useGetJournalReview } from '@/api/generated/journal/journal';
import { PATHS } from '@/app/paths';
import { Card } from '@/components/common/Card';
import { KpiCard } from '@/components/common/KpiCard';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { addDaysIso, formatLongDate } from '@/lib/dates';
import { WorkCard } from '../components/WorkCard';
import { PERIOD_FILTERS, useJournalFilters } from '../journal/useJournalFilters';
import { DaysCard } from './DaysCard';
import { PeopleCard } from './PeopleCard';
import { ReviewItemsCard } from './ReviewItemsCard';

const REVIEW_REFRESH_MS = 60_000;

/** «6,5 ч» — часы работы через агентов. */
const hoursOf = (minutes: number): string =>
  `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 }).format(minutes / 60)}\u00a0ч`;

/**
 * Разбор: где получилось, где упирались, что мешало — по итогам работ и
 * записям агентов по ходу. Фильтр по человеку и периоду — общий с журналом.
 */
export const JournalReviewPage = () => {
  const { userId, period, update } = useJournalFilters();
  // Сутки разбора — UTC, как вся статистика: границы периода из сегодняшней даты UTC.
  const today = new Date().toISOString().slice(0, 10);
  const from = addDaysIso(today, -(Number(period) - 1));
  const { data, isLoading } = useGetJournalReview(
    { from, to: today, ...(userId ? { userId } : {}) },
    { query: { refetchInterval: REVIEW_REFRESH_MS, placeholderData: (previous) => previous } },
  );
  const review = data?.data;
  const totals = review?.totals;

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Разбор"
        subtitle="Где получилось, где упирались, что мешало — по итогам работ и записям агентов."
        backTo={PATHS.journal}
        actions={(
          <Button variant="outline" size="sm" asChild>
            <Link to={PATHS.journal}><NotebookPen /> Журнал</Link>
          </Button>
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl size="sm" segments={[...PERIOD_FILTERS]} value={period} onChange={(value) => update({ days: value === '30' ? null : value })} />
          {userId && <Button variant="soft" size="sm" onClick={() => update({ person: null })}>Вся команда</Button>}
          <span className="text-[12.5px] text-ink-faint">{formatLongDate(from)} — {formatLongDate(today)} · сутки по UTC, как во всей статистике</span>
        </div>
      </PageHeader>

      {isLoading || !review || !totals ? (
        <div className="grid grid-cols-2 gap-3 px-4 lg:grid-cols-5 lg:px-0">
          {Array.from({ length: 5 }, (_, index) => <div key={index} className="skeleton h-[150px] rounded-card" />)}
        </div>
      ) : (
        <div className="flex flex-col gap-4 lg:gap-5">
          <div className="grid grid-cols-2 gap-3 px-4 lg:grid-cols-5 lg:gap-5 lg:px-0">
            <KpiCard highlighted compact label="Работ" value={totals.sessions} hint={`людей: ${totals.people}`} to={PATHS.journal} />
            <KpiCard compact label="Через агентов" value={hoursOf(totals.activeMinutes)} hint="активной работы" />
            <KpiCard compact label="Сделано" value={totals.done} hint={`продвинулись: ${totals.progress}`} />
            <KpiCard compact label="Упёрлись" value={totals.blocked + totals.failed} hint={`не получилось: ${totals.failed}`} />
            <KpiCard compact label="Без итога" value={totals.abandoned} hint="агент не закрыл работу" className="col-span-2 lg:col-span-1" />
          </div>

          <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:gap-5 lg:px-0">
            <ReviewItemsCard title="Минусы" icon={TriangleAlert} tone="bg-rose-50 text-rose-600" items={review.minuses} empty="Минусов не записано — или агенты о них молчат." />
            <ReviewItemsCard title="Плюсы" icon={Sparkles} tone="bg-emerald-50 text-emerald-700" items={review.pluses} empty="Плюсов пока не записано." />
          </div>

          <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-12 lg:gap-5 lg:px-0">
            <div className="lg:col-span-7">
              <PeopleCard people={review.people} selectedId={userId} onSelect={(id) => update({ person: id })} />
            </div>
            <div className="flex flex-col gap-4 lg:col-span-5 lg:gap-5">
              <DaysCard days={review.days} />
              <ReviewItemsCard title="Вопросы людям" icon={CircleHelp} tone="bg-amber-50 text-amber-700" items={review.questions} empty="Открытых вопросов нет." />
            </div>
          </div>

          {review.stuck.length > 0 && (
            <Card title={`Где упёрлись · ${review.stuck.length}`} className="mx-4 lg:mx-0">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {review.stuck.map((session) => <WorkCard key={session.id} session={session} />)}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
