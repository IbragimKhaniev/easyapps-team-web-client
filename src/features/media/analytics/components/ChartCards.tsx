import { useState } from 'react';

import type { Analytics, SeriesPoint, SocialPlatform } from '@/api/models';
import { Card } from '@/components/common/Card';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { SeriesChart } from './SeriesChart';

/** У ряда нет ни одной точки — график не рисуем, а говорим, чего ждать. */
const isEmpty = (series: SeriesPoint[], platforms: SocialPlatform[]): boolean =>
  series.every((point) => platforms.every((platform) => point[platform] === null || point[platform] === 0));

const NoData = ({ hint }: { hint: string }) => (
  <div className="flex h-[240px] items-center justify-center rounded-2xl bg-secondary/70 px-6 text-center text-[13px] leading-relaxed text-ink-muted">{hint}</div>
);

type TFollowersView = 'total' | 'flow';

/** Подписчики: всего по дням или пришли/ушли. */
export const FollowersCard = ({ analytics, platforms }: { analytics: Analytics; platforms: SocialPlatform[] }) => {
  const [view, setView] = useState<TFollowersView>('total');
  const flowEmpty = isEmpty(analytics.followersGainedSeries, platforms) && isEmpty(analytics.followersLostSeries, platforms);

  return (
    <Card
      title="Подписчики"
      action={<SegmentedControl segments={[{ value: 'total', label: 'Всего' }, { value: 'flow', label: 'Пришли и ушли' }]} value={view} onChange={setView} size="sm" />}
      className="h-full"
    >
      {view === 'total' ? (
        isEmpty(analytics.followersSeries, platforms)
          ? <NoData hint="Число подписчиков записывается при каждом обходе сборщика — график появится после первого." />
          : <SeriesChart data={analytics.followersSeries} platforms={platforms} kind="area" label="Подписчики" />
      ) : flowEmpty ? (
        <NoData hint="Пришедших и ушедших отдают VK (stats.get) и Telegram (статистика канала через MTProto)." />
      ) : (
        <div className="flex flex-col gap-4">
          <SeriesChart data={analytics.followersGainedSeries} platforms={platforms} kind="bar" stacked label="Пришли" height={150} />
          <SeriesChart data={analytics.followersLostSeries} platforms={platforms} kind="bar" stacked label="Ушли" height={120} />
        </div>
      )}
    </Card>
  );
};

type TActivityView = 'postViews' | 'accountViews' | 'reach' | 'posts';

const ACTIVITY: Array<{ value: TActivityView; label: string; key: keyof Analytics; empty: string }> = [
  { value: 'postViews', label: 'Просмотры постов', key: 'postViewsSeries', empty: 'Просмотры постов, вышедших в эти дни, появятся после сбора статистики.' },
  { value: 'accountViews', label: 'Просмотры аккаунта', key: 'accountViewsSeries', empty: 'Просмотры аккаунта по дням отдают VK, Instagram и Telegram (MTProto).' },
  { value: 'reach', label: 'Охват', key: 'reachSeries', empty: 'Охват аккаунта по дням отдают VK и Instagram.' },
  { value: 'posts', label: 'Посты', key: 'postsSeries', empty: 'За период постов не было.' },
];

/** Активность по дням: просмотры, охват, число постов. */
export const ActivityCard = ({ analytics, platforms }: { analytics: Analytics; platforms: SocialPlatform[] }) => {
  const [view, setView] = useState<TActivityView>('postViews');
  const current = ACTIVITY.find((item) => item.value === view)!;
  const series = analytics[current.key] as SeriesPoint[];

  return (
    <Card title="Активность по дням" className="h-full">
      <div className="-mt-1 mb-4 overflow-x-auto scrollbar-none">
        <SegmentedControl segments={ACTIVITY.map(({ value, label }) => ({ value, label }))} value={view} onChange={setView} size="sm" />
      </div>
      {isEmpty(series, platforms)
        ? <NoData hint={current.empty} />
        : <SeriesChart data={series} platforms={platforms} kind="bar" stacked={platforms.length > 1} label={current.label} />}
    </Card>
  );
};
