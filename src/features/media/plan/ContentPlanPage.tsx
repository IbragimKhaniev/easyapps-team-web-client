import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

import { useGetMediaSummary } from '@/api/generated/media-posts/media-posts';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import { MediaSectionTabs } from '../components/MediaSectionTabs';
import { PlatformFilter } from '../components/PlatformFilter';
import { usePostParam } from '../hooks/usePostParam';
import { monthTitle } from '../lib/calendar';
import { CompactMonth } from './components/CompactMonth';
import { DayPanel } from './components/DayPanel';
import { MonthGrid } from './components/MonthGrid';
import { usePlanMonth } from './hooks/usePlanMonth';
import { usePlanMoves } from './hooks/usePlanMoves';
import { usePlanState } from './hooks/usePlanState';

/**
 * Контент-план: какой пост в какой день выходит и куда. Компьютер — месяц
 * сеткой и раскрытый день справа; телефон — месяц с точками и список дня
 * под ним, как «Календарь» iOS.
 */
export const ContentPlanPage = () => {
  const isDesktop = useIsDesktop();
  const state = usePlanState();
  const { weeks, postsOf, isLoading } = usePlanMonth(state.month, state.platform);
  const { movePost, addIdea, adding } = usePlanMoves();
  const { openPost, openNewPost } = usePostParam();
  const { data: summaryData } = useGetMediaSummary({ query: { refetchInterval: 60_000 } });
  const summary = summaryData?.data;

  const subtitle = summary
    ? `Запланировано: ${summary.scheduledCount} · вышло за неделю: ${summary.publishedLast7Days}${summary.failedCount ? ` · с ошибкой: ${summary.failedCount}` : ''} · идей: ${summary.ideasCount}`
    : undefined;

  const monthNav = (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon-sm" onClick={() => state.shift(-1)} aria-label="Прошлый месяц">
        <ChevronLeft />
      </Button>
      <span className="min-w-[150px] text-center text-[17px] font-bold tracking-tight text-ink">{monthTitle(state.month)}</span>
      <Button variant="ghost" size="icon-sm" onClick={() => state.shift(1)} aria-label="Следующий месяц">
        <ChevronRight />
      </Button>
      <Button variant="soft" size="sm" onClick={state.goToday} className="ml-1">
        Сегодня
      </Button>
    </div>
  );

  const dayPanel = (
    <DayPanel
      date={state.day}
      posts={postsOf(state.day)}
      onOpen={openPost}
      onCreate={openNewPost}
      onAddIdea={addIdea}
      addingIdea={adding}
    />
  );

  if (isDesktop) {
    return (
      <div className="animate-fade-up">
        <PageHeader
          title="Контент-план"
          subtitle={subtitle}
          actions={
            <Button size="lg" onClick={() => openNewPost(state.day)}>
              <Plus /> Новый пост
            </Button>
          }
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            {monthNav}
            <PlatformFilter value={state.platform} onChange={state.setPlatform} />
          </div>
        </PageHeader>
        <div className="grid grid-cols-12 gap-5">
          <div className={cn('card-surface col-span-8 p-4 transition-opacity', isLoading && 'opacity-60')}>
            <MonthGrid
              weeks={weeks}
              postsOf={postsOf}
              selected={state.day}
              onSelect={state.selectDay}
              onOpen={openPost}
              onCreate={openNewPost}
              onMove={(post, iso) => void movePost(post, iso)}
            />
          </div>
          <div className="col-span-4">
            <div className="sticky top-0">{dayPanel}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Контент-план"
        actions={
          <Button size="icon" onClick={() => openNewPost(state.day)} aria-label="Новый пост">
            <Plus />
          </Button>
        }
      >
        <MediaSectionTabs />
      </PageHeader>
      <div className="mt-4 flex flex-col gap-4 px-4">
        <div className="card-surface p-3">
          <div className="mb-2 flex items-center justify-between">{monthNav}</div>
          <CompactMonth weeks={weeks} postsOf={postsOf} selected={state.day} onSelect={state.selectDay} />
        </div>
        <PlatformFilter value={state.platform} onChange={state.setPlatform} size="sm" className="w-full" />
        {dayPanel}
      </div>
    </div>
  );
};
