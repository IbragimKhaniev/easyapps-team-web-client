import { Clapperboard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { useListPipelineProjects } from '@/api/generated/pipeline/pipeline';
import { PATHS, pipelineHref, type TPipelineTab } from '@/app/paths';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { useMembers } from '@/hooks/useDirectory';
import { cn } from '@/lib/utils';
import { MediaSectionTabs } from '../media/components/MediaSectionTabs';
import { CellSheet } from './components/CellSheet';
import { HeroSheet } from './components/HeroSheet';
import { VideoSheet } from './components/VideoSheet';
import { usePipelineActions } from './hooks/usePipelineActions';
import { usePipelineData } from './hooks/usePipelineData';
import { usePipelineParams } from './hooks/usePipelineParams';
import { CastTab } from './tabs/CastTab';
import { LibraryTab } from './tabs/LibraryTab';
import { LogTab } from './tabs/LogTab';
import { OverviewTab } from './tabs/OverviewTab';
import { VideosTab } from './tabs/VideosTab';

const TABS: Array<{ tab: TPipelineTab | null; label: string }> = [
  { tab: null, label: 'Обзор' },
  { tab: 'cast', label: 'Каст' },
  { tab: 'library', label: 'Библиотека' },
  { tab: 'videos', label: 'Ролики' },
  { tab: 'log', label: 'Журнал' },
];

/**
 * Конвейер роликов: пульт фабрики коротких роликов — каст, библиотека клипов,
 * ролики и их проверка, журнал. Данные и файлы — в team.easyapps.click, работу
 * делают агенты команды локально (MCP easyapps-team и утилита pipeline.mjs).
 */
export const PipelinePage = () => {
  const params = usePipelineParams();
  const navigate = useNavigate();
  const { state, lookups, isLoading, error } = usePipelineData(params.project);
  const actions = usePipelineActions(params.project);
  const { map: members } = useMembers();
  const { data: projectsData } = useListPipelineProjects();
  const projects = projectsData?.data ?? [];

  const openRef = (kind: string, key: string) => {
    if (kind === 'video') params.openVideo(key);
    else if (kind === 'cell') params.openCell(key);
    else if (kind === 'character') params.openHero(key);
  };

  if (error && !state) {
    return (
      <EmptyState
        icon={Clapperboard}
        title="Конвейер не найден"
        description="Ссылка устарела или конвейер переименовали."
        action={<Button asChild><Link to={PATHS.pipeline}>Ко всем конвейерам</Link></Button>}
      />
    );
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={state?.meta.title ?? 'Конвейер роликов'}
        subtitle={state?.meta.audience || 'Каст, библиотека клипов, ролики и их проверка'}
        actions={projects.length > 1 && (
          <select
            value={params.project}
            onChange={(event) => navigate(pipelineHref(event.target.value, params.tab))}
            className="h-10 rounded-full border border-black/[0.08] bg-white px-4 text-[14px] font-semibold text-ink"
            aria-label="Конвейер"
          >
            {projects.map((project) => <option key={project.key} value={project.key}>{project.title}</option>)}
          </select>
        )}
      >
        <MediaSectionTabs />
        <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none lg:mx-0 lg:px-0">
          {TABS.map((item) => (
            <Link
              key={item.label}
              to={pipelineHref(params.project, item.tab)}
              className={cn(
                'inline-flex h-9 shrink-0 items-center rounded-full px-4 text-[14px] font-bold transition-colors',
                params.tab === item.tab ? 'bg-brand-600 text-white' : 'bg-white text-ink-soft shadow-card',
              )}
            >
              {item.label}
              {item.tab === 'videos' && state && state.videos.some((video) => video.status === 'review') && (
                <span className={cn('ml-1.5 rounded-full px-1.5 text-[11px]', params.tab === 'videos' ? 'bg-white/25' : 'bg-amber-100 text-amber-800')}>
                  {state.videos.filter((video) => video.status === 'review').length}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </PageHeader>

      <div className="px-4 lg:px-0">
        {isLoading || !state || !lookups ? (
          <div className="flex flex-col gap-4">
            <div className="skeleton h-28 rounded-card" />
            <div className="skeleton h-72 rounded-card" />
          </div>
        ) : (
          <>
            {!state.storage && (
              <p className="mb-4 rounded-2xl bg-amber-50 p-3 text-[14px] text-amber-900">Хранилище файлов не настроено — клипы и ролики не загрузятся (см. «Площадки» → хранилище).</p>
            )}
            {params.tab === null && <OverviewTab state={state} lookups={lookups} actions={actions} members={members} onOpenRef={openRef} />}
            {params.tab === 'cast' && <CastTab state={state} lookups={lookups} actions={actions} onOpenHero={params.openHero} />}
            {params.tab === 'library' && (
              <LibraryTab
                state={state}
                lookups={lookups}
                actions={actions}
                filter={params.filter}
                openCell={params.cell}
                onFilter={params.setFilter}
                onOpenCell={params.openCell}
                onOpenHero={params.openHero}
              />
            )}
            {params.tab === 'videos' && <VideosTab state={state} lookups={lookups} onOpenVideo={params.openVideo} />}
            {params.tab === 'log' && <LogTab project={params.project} actions={actions} members={members} onOpenRef={openRef} />}

            <CellSheet cellKey={params.cell} lookups={lookups} spec={state.spec} actions={actions} onClose={params.closeSheets} />
            <VideoSheet number={params.video} lookups={lookups} actions={actions} onClose={params.closeSheets} />
            <HeroSheet heroKey={params.hero} lookups={lookups} actions={actions} onClose={params.closeSheets} onOpenVideo={params.openVideo} />
          </>
        )}
      </div>
    </div>
  );
};
