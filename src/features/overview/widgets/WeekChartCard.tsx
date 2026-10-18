import type { OverviewDay } from '@/api/models';
import { PillBarChart } from '@/components/charts/PillBarChart';
import { Card } from '@/components/common/Card';
import { pluralize, TASK_FORMS } from '@/lib/plural';
import { weekBars } from '../lib/week';

interface IWeekChartCardProps {
  days: OverviewDay[];
  today: string;
  doneThisWeek: number;
}

/** «Закрыто за неделю» — столбики-капсулы по дням текущей недели. */
export const WeekChartCard = ({ days, today, doneThisWeek }: IWeekChartCardProps) => (
  <Card
    title="Закрыто за неделю"
    action={<span className="text-[13px] font-semibold text-ink-muted">{pluralize(doneThisWeek, TASK_FORMS)}</span>}
  >
    <PillBarChart bars={weekBars(days, today)} />
  </Card>
);
