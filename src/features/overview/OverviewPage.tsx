import { LayoutGrid, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useGetOverview } from '@/api/generated/overview/overview';
import { PATHS } from '@/app/paths';
import { uiActions } from '@/app/uiStore';
import { KpiCard } from '@/components/common/KpiCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { useMembers, useProjects } from '@/hooks/useDirectory';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useSession } from '@/hooks/useSession';
import { greeting, todayIso } from '@/lib/dates';
import { MediaPulseCard } from './widgets/MediaPulseCard';
import { MyTasksCard } from './widgets/MyTasksCard';
import { NextUpCard } from './widgets/NextUpCard';
import { ProgressCard } from './widgets/ProgressCard';
import { ProjectsCard } from './widgets/ProjectsCard';
import { TeamCard } from './widgets/TeamCard';
import { TodayTile } from './widgets/TodayTile';
import { WeekChartCard } from './widgets/WeekChartCard';

const OVERVIEW_REFRESH_MS = 60_000;

const OverviewSkeleton = () => (
  <div className="grid grid-cols-2 gap-4 px-4 lg:grid-cols-4 lg:px-0">
    {Array.from({ length: 4 }, (_, index) => (
      <div key={index} className="skeleton h-[172px] rounded-card" />
    ))}
  </div>
);

/** Сводка — экран, который открывают утром: цифры, неделя, люди, проекты. */
export const OverviewPage = () => {
  const today = todayIso();
  const isDesktop = useIsDesktop();
  const { user } = useSession();
  const { list: members } = useMembers();
  const { list: projects } = useProjects();
  const { data, isLoading } = useGetOverview({ today, days: 14 }, { query: { refetchInterval: OVERVIEW_REFRESH_MS } });
  const overview = data?.data;
  const firstName = user?.name.split(' ')[0] ?? '';

  const counts = overview?.counts;
  const subtitle = counts
    ? `${greeting()}, ${firstName}. В работе ${counts.inProgress}, на проверке ${counts.review}${counts.overdue ? `, просрочено ${counts.overdue}` : ''}.`
    : `${greeting()}, ${firstName}.`;

  const kpis = counts && (
    <div className="grid grid-cols-2 gap-3 px-4 lg:grid-cols-4 lg:gap-5 lg:px-0">
      <KpiCard
        highlighted
        label="Открытые задачи"
        value={counts.open}
        delta={counts.createdThisWeek - counts.createdPrevWeek}
        hint={`новых за неделю: ${counts.createdThisWeek}`}
        to={PATHS.tasks}
      />
      <KpiCard label="В работе" value={counts.inProgress} hint={`на проверке: ${counts.review}`} to={`${PATHS.tasks}?view=board`} />
      <KpiCard
        label="Закрыто за неделю"
        value={counts.doneThisWeek}
        delta={counts.doneThisWeek - counts.donePrevWeek}
        hint="к прошлой неделе"
      />
      <KpiCard label="Просрочено" value={counts.overdue} hint={counts.overdue ? 'срок вышел' : 'всё в срок'} to={PATHS.myTasks} />
    </div>
  );

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Сводка"
        subtitle={subtitle}
        actions={
          isDesktop ? (
            <>
              <Button size="lg" onClick={() => uiActions.openQuickAdd()}>
                <Plus /> Новая задача
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to={`${PATHS.tasks}?view=board`}>
                  <LayoutGrid /> Доска
                </Link>
              </Button>
            </>
          ) : undefined
        }
      />

      {isLoading || !overview ? (
        <OverviewSkeleton />
      ) : isDesktop ? (
        <div className="flex flex-col gap-5">
          {kpis}
          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-12 xl:col-span-6">
              <WeekChartCard days={overview.days} today={overview.today} doneThisWeek={overview.counts.doneThisWeek} />
            </div>
            <div className="col-span-6 xl:col-span-3">
              <NextUpCard tasks={overview.myTasks} today={overview.today} />
            </div>
            <div className="col-span-6 xl:col-span-3">
              <ProjectsCard projects={projects} progress={overview.projects} />
            </div>
            <div className="col-span-12 xl:col-span-5">
              <TeamCard members={members} workload={overview.workload} />
            </div>
            <div className="col-span-6 xl:col-span-4">
              <ProgressCard byStatus={overview.byStatus} />
            </div>
            <div className="col-span-6 xl:col-span-3">
              <TodayTile dueToday={overview.counts.dueToday} overdue={overview.counts.overdue} />
            </div>
            <div className="col-span-12">
              <MediaPulseCard />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {kpis}
          <div className="flex flex-col gap-4 px-4">
            <MyTasksCard tasks={overview.myTasks} />
            <TodayTile dueToday={overview.counts.dueToday} overdue={overview.counts.overdue} />
            <MediaPulseCard />
            <WeekChartCard days={overview.days} today={overview.today} doneThisWeek={overview.counts.doneThisWeek} />
            <ProgressCard byStatus={overview.byStatus} />
            <TeamCard members={members} workload={overview.workload} />
            <ProjectsCard projects={projects} progress={overview.projects} />
          </div>
        </div>
      )}
    </div>
  );
};
