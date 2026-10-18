import { BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useGetMediaAnalytics } from '@/api/generated/media-analytics/media-analytics';
import type { SocialPlatform } from '@/api/models';
import { PATHS } from '@/app/paths';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/common/EmptyState';
import { KpiCard } from '@/components/common/KpiCard';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { MediaSectionTabs } from '../components/MediaSectionTabs';
import { PlatformFilter } from '../components/PlatformFilter';
import { formatCompact, formatDelta, formatPercent } from '../lib/format';
import { PLATFORM_META, PLATFORM_ORDER } from '../lib/platforms';
import { BestTimeHeatmap } from './components/BestTimeHeatmap';
import { ActivityCard, FollowersCard } from './components/ChartCards';
import { ContentTypesCard } from './components/ContentTypesCard';
import { PlatformsCard } from './components/PlatformsCard';
import { TopPostsCard } from './components/TopPostsCard';
import { PERIODS, useAnalyticsState } from './hooks/useAnalyticsState';

const ANALYTICS_REFRESH_MS = 5 * 60_000;

const AnalyticsSkeleton = () => (
  <div className="flex flex-col gap-4 px-4 lg:px-0">
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {Array.from({ length: 5 }, (_, index) => <div key={index} className="skeleton h-[172px] rounded-card" />)}
    </div>
    <div className="skeleton h-80 rounded-card" />
  </div>
);

/**
 * Глубокая аналитика: все площадки вместе или одна — подписчики и их
 * движение, просмотры и охват по дням, что заходит лучше, когда выходить,
 * лучшие посты. Сутки в рядах — UTC, как во всей статистике платформы.
 */
export const AnalyticsPage = () => {
  const state = useAnalyticsState();
  const { data, isLoading } = useGetMediaAnalytics(
    { from: state.from, to: state.to, platform: state.platform ?? undefined, tz: state.tz },
    { query: { refetchInterval: ANALYTICS_REFRESH_MS, placeholderData: (previous) => previous } },
  );
  const analytics = data?.data;
  const platforms: SocialPlatform[] = state.platform ? [state.platform] : PLATFORM_ORDER;
  const title = state.platform ? `Аналитика ${PLATFORM_META[state.platform].title}` : 'Аналитика';

  const controls = (
    <div className="flex flex-wrap items-center gap-2">
      <PlatformFilter value={state.platform} onChange={state.setPlatform} />
      <SegmentedControl segments={PERIODS} value={state.period} onChange={state.setPeriod} />
    </div>
  );

  const hasAnyData = analytics && (analytics.totals.posts > 0 || analytics.totals.followers > 0);

  return (
    <div className="animate-fade-up">
      <PageHeader title={title} subtitle="Сутки в графиках — по UTC; лучшее время — по вашим часам">
        <div className="flex flex-col gap-3">
          <MediaSectionTabs />
          {controls}
        </div>
      </PageHeader>

      {isLoading || !analytics ? (
        <AnalyticsSkeleton />
      ) : !hasAnyData ? (
        <div className="card-surface mx-4 lg:mx-0">
          <EmptyState
            icon={BarChart3}
            title="Данных пока нет"
            description="Статистику собирают фоновые задачи: посты и метрики — каждые 30–60 минут, сутки аккаунта — несколько раз в день. Подключите площадки — первые цифры появятся после первого обхода."
            action={<Button variant="soft" asChild><Link to={PATHS.media.settings}>Площадки и задачи</Link></Button>}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4 px-4 lg:gap-5 lg:px-0">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-5">
            <KpiCard
              compact
              highlighted
              label="Подписчики"
              value={formatCompact(analytics.totals.followers)}
              delta={analytics.totals.followersDelta}
              hint={`${formatDelta(analytics.totals.followersDelta)} за период`}
            />
            <KpiCard compact label="Просмотры постов" value={formatCompact(analytics.totals.views)} hint={`${analytics.totals.posts} постов`} />
            <KpiCard compact label="Взаимодействия" value={formatCompact(analytics.totals.interactions)} hint="лайки, реакции, комментарии, репосты" />
            <KpiCard compact label="Вовлечённость" value={formatPercent(analytics.totals.engagementRate)} hint="взаимодействия к охвату" />
            <KpiCard
              compact
              label="В среднем на пост"
              value={formatCompact(analytics.totals.posts ? Math.round(analytics.totals.views / analytics.totals.posts) : null)}
              hint="просмотров"
              className="col-span-2 lg:col-span-1"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
            <div className="lg:col-span-7"><FollowersCard analytics={analytics} platforms={platforms} /></div>
            <div className="lg:col-span-5">
              {state.platform ? <ContentTypesCard stats={analytics.byContentType} /> : <PlatformsCard platforms={analytics.platforms} onPick={state.setPlatform} />}
            </div>
            <div className="lg:col-span-12"><ActivityCard analytics={analytics} platforms={platforms} /></div>
            <div className="lg:col-span-12">
              <Card title="Когда выходить">
                {analytics.bestTimes.length ? <BestTimeHeatmap cells={analytics.bestTimes} /> : <p className="text-[13px] text-ink-muted">Нужны посты за период.</p>}
              </Card>
            </div>
            <div className={state.platform ? 'lg:col-span-12' : 'lg:col-span-7'}>
              <TopPostsCard posts={analytics.topPosts} wide={Boolean(state.platform)} />
            </div>
            {!state.platform && <div className="lg:col-span-5"><ContentTypesCard stats={analytics.byContentType} /></div>}
          </div>
        </div>
      )}
    </div>
  );
};
