import { Link } from 'react-router-dom';

import { useGetHiggsfieldState } from '@/api/generated/higgsfield/higgsfield';
import type { PipelineState, TeamMember } from '@/api/models';
import { PATHS, pipelineHref } from '@/app/paths';
import { Card } from '@/components/common/Card';
import { CLIP_FORMS, CREDIT_FORMS, plural, pluralize } from '@/lib/plural';
import { cn } from '@/lib/utils';
import { EventFeed } from '../components/EventFeed';
import { NextMovesCard } from '../components/NextMovesCard';
import { PhasesStrip } from '../components/PhasesStrip';
import { Ticks } from '../components/Ticks';
import type { TPipelineActions } from '../hooks/usePipelineActions';
import type { IPipelineLookups } from '../hooks/usePipelineData';
import { VIDEO_STATUS_META, VIDEO_STATUS_ORDER } from '../lib/pipelineMeta';

interface IOverviewTabProps {
  state: PipelineState;
  lookups: IPipelineLookups;
  actions: TPipelineActions;
  members: Map<string, TeamMember>;
  onOpenRef: (kind: string, key: string) => void;
}

const RECENT_EVENTS = 6;

/** Общий аккаунт Higgsfield коротко: подключён ли и сколько кредитов. */
const HiggsfieldCard = () => {
  const { data } = useGetHiggsfieldState({ query: { refetchInterval: 60_000 } });
  const state = data?.data;
  const connected = state?.status === 'connected';
  const credits = state?.balance.credits;
  return (
    <Card title="Higgsfield команды" action={<Link to={PATHS.media.settings} className="text-[13px] font-semibold text-brand-800">Площадки</Link>}>
      {!state ? <div className="skeleton h-12 rounded-xl" /> : connected ? (
        <div className="flex flex-col gap-1 text-[14px] text-ink-soft">
          <span><b className="text-[22px] text-ink">{credits ?? '—'}</b> {credits !== null && credits !== undefined ? plural(credits, CREDIT_FORMS) : ''}{state.balance.plan ? ` · ${state.balance.plan}` : ''}</span>
          <span className="text-[13px] text-ink-muted">Общий аккаунт {state.account.email ?? ''} — агенты генерируют через MCP команды, без своего входа.</span>
        </div>
      ) : (
        <p className="text-[14px] text-ink-muted">Не подключён: админ подключает общий аккаунт в «Площадках» — тогда агенты команды смогут генерировать кадры и клипы.</p>
      )}
    </Card>
  );
};

export const OverviewTab = ({ state, lookups, actions, members, onOpenRef }: IOverviewTabProps) => {
  const mainHeroes = state.characters.filter((hero) => hero.isMain);
  const counts = Object.fromEntries(VIDEO_STATUS_ORDER.map((status) => [status, state.videos.filter((video) => video.status === status).length]));
  return (
    <div className="flex flex-col gap-5">
      <PhasesStrip phases={state.meta.phases} />
      <NextMovesCard moves={state.meta.next} actions={actions} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
        <Card className="lg:col-span-7" title={`Библиотека: ${lookups.cellCounts.done} из ${pluralize(state.cells.length, CLIP_FORMS)}`} action={<Link to={pipelineHref(state.project.key, 'library')} className="text-[13px] font-semibold text-brand-800">Открыть</Link>}>
          <div className="flex flex-col gap-3">
            {mainHeroes.map((hero) => {
              const cells = lookups.cellsOf(hero.key);
              return (
                <div key={hero.key} className="grid grid-cols-[120px_1fr_auto] items-center gap-3">
                  <span className="flex items-center gap-2 truncate text-[14px] font-semibold text-ink"><i className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: hero.data.color ?? '#9CA3AF' }} />{hero.name}</span>
                  <Ticks cells={cells} sceneBy={lookups.sceneBy} />
                  <span className="font-mono text-[12.5px] text-ink-faint">{cells.filter((cell) => cell.status === 'done').length}/{cells.length}</span>
                </div>
              );
            })}
          </div>
        </Card>
        <Card className="lg:col-span-5" title="Последнее" action={<Link to={pipelineHref(state.project.key, 'log')} className="text-[13px] font-semibold text-brand-800">Журнал</Link>}>
          <EventFeed events={state.events.slice(0, RECENT_EVENTS)} members={members} onOpenRef={onOpenRef} />
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
        <Card className="lg:col-span-8" title="Ролики">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {VIDEO_STATUS_ORDER.map((status) => (
              <Link
                key={status}
                to={pipelineHref(state.project.key, 'videos')}
                className={cn('flex flex-col gap-1 rounded-2xl p-3 transition hover:shadow-card', status === 'review' && counts[status] ? 'bg-amber-50 ring-1 ring-amber-200' : 'bg-panel')}
              >
                <b className="text-[24px] leading-none text-ink">{counts[status]}</b>
                <span className="text-[12.5px] font-semibold text-ink-muted">{VIDEO_STATUS_META[status].label}</span>
              </Link>
            ))}
          </div>
        </Card>
        <div className="lg:col-span-4"><HiggsfieldCard /></div>
      </div>
    </div>
  );
};
