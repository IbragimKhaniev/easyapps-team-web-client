import type { OverviewStatusCount } from '@/api/models';
import { GaugeChart } from '@/components/charts/GaugeChart';
import { Card } from '@/components/common/Card';

/** Прогресс команды: закрыто / в работе / ждёт — полукольцо, как «Project Progress». */
export const ProgressCard = ({ byStatus }: { byStatus: OverviewStatusCount[] }) => {
  const count = (statuses: string[]) => byStatus.filter((item) => statuses.includes(item.status)).reduce((sum, item) => sum + item.count, 0);
  const done = count(['done']);
  const active = count(['in_progress', 'review']);
  const waiting = count(['backlog', 'todo']);
  const total = done + active + waiting;
  const percent = total ? Math.round((done / total) * 100) : 0;

  return (
    <Card title="Прогресс">
      <GaugeChart
        centerValue={`${percent}%`}
        centerLabel="задач закрыто"
        segments={[
          { label: 'Готово', value: done, color: '#0B82B5' },
          { label: 'В работе', value: active, color: '#0E5878' },
          { label: 'Ждут', value: waiting, color: '#F3F6F8', hatched: true },
        ]}
      />
    </Card>
  );
};
