import { Bot, NotebookPen, Scale, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { useListJournalSessions } from '@/api/generated/journal/journal';
import type { JournalSession, ListJournalSessionsParams } from '@/api/models';
import { PATHS } from '@/app/paths';
import { EmptyState } from '@/components/common/EmptyState';
import { MemberAvatar } from '@/components/common/MemberAvatar';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import { useMembers } from '@/hooks/useDirectory';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { addDaysIso, formatLongDate, todayIso } from '@/lib/dates';
import { pluralize, WORK_FORMS } from '@/lib/plural';
import { cn } from '@/lib/utils';
import { WorkCard } from '../components/WorkCard';
import { OUTCOME_FILTERS, PERIOD_FILTERS, TOutcomeFilter, useJournalFilters } from './useJournalFilters';

const LIVE_REFRESH_MS = 10_000;
const FEED_REFRESH_MS = 30_000;
const PAGE_SIZE = 30;
const FEED_MAX = 100;
const SEARCH_DEBOUNCE_MS = 300;

/** Фильтр исхода → параметры ленты. Без фильтра — только закрытые: живые работы — в блоке выше. */
const outcomeParams = (outcome: TOutcomeFilter): Pick<ListJournalSessionsParams, 'status' | 'outcome'> => {
  if (outcome === 'all') return { status: 'finished,abandoned' };
  if (outcome === 'abandoned') return { status: 'abandoned' };
  return { status: 'finished', outcome };
};

/** Работы по дням начала — в часовом поясе человека. */
const groupByDay = (sessions: JournalSession[]): Array<{ date: string; items: JournalSession[] }> => {
  const groups = new Map<string, JournalSession[]>();
  for (const session of sessions) {
    const date = todayIso(new Date(session.startedAt));
    groups.set(date, [...(groups.get(date) ?? []), session]);
  }
  return [...groups.entries()].map(([date, items]) => ({ date, items }));
};

const dayTitle = (date: string): string => {
  const today = todayIso();
  if (date === today) return 'Сегодня';
  if (date === addDaysIso(today, -1)) return 'Вчера';
  return formatLongDate(date);
};

/** Кто сейчас работает через агента — с последней записью хода. */
const LiveWork = () => {
  const { data } = useListJournalSessions({ status: 'active', limit: 20 }, { query: { refetchInterval: LIVE_REFRESH_MS } });
  const live = data?.data ?? [];
  if (!live.length) return null;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 px-4 text-[13px] font-bold uppercase tracking-[0.08em] text-ink-faint lg:px-0">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        Сейчас работают · {live.length}
      </h2>
      <div className="grid grid-cols-1 gap-3 px-4 md:grid-cols-2 lg:px-0 xl:grid-cols-3">
        {live.map((session) => <WorkCard key={session.id} session={session} />)}
      </div>
    </section>
  );
};

/**
 * Журнал работы: что команда делает через агентов — запросы, шаги, результаты,
 * плюсы и минусы, чем закончилось. Живые работы сверху, ниже — по дням.
 */
export const JournalPage = () => {
  const isDesktop = useIsDesktop();
  const { list: members } = useMembers();
  const { userId, outcome, period, q, update } = useJournalFilters();
  const [query, setQuery] = useState(q);
  const debounced = useDebounce(query.trim(), SEARCH_DEBOUNCE_MS);
  const [limit, setLimit] = useState(PAGE_SIZE);

  useEffect(() => {
    update({ q: debounced || null });
  }, [debounced, update]);
  useEffect(() => setLimit(PAGE_SIZE), [userId, outcome, period, q]);

  const today = todayIso();
  const params: ListJournalSessionsParams = {
    from: addDaysIso(today, -(Number(period) - 1)),
    to: today,
    ...(userId ? { userId } : {}),
    ...(q ? { q } : {}),
    ...outcomeParams(outcome),
    limit,
  };
  const { data, isLoading } = useListJournalSessions(params, { query: { refetchInterval: FEED_REFRESH_MS, placeholderData: (previous) => previous } });
  const sessions = useMemo(() => data?.data ?? [], [data]);
  const total = data?.pagination.totalItems ?? 0;
  const days = useMemo(() => groupByDay(sessions), [sessions]);

  const headerActions = (
    <>
      <Button size={isDesktop ? 'lg' : 'sm'} variant="outline" asChild>
        <Link to={PATHS.journalReview}><Scale /> Разбор</Link>
      </Button>
      {isDesktop && (
        <Button size="lg" asChild>
          <Link to={PATHS.agents}><Bot /> Подключить агента</Link>
        </Button>
      )}
    </>
  );

  return (
    <div className="animate-fade-up">
      <PageHeader title="Журнал работы" subtitle="Как команда работает через агентов: что делали, чем закончилось, где упирались." actions={headerActions}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => update({ person: null })}
              className={cn('h-9 shrink-0 rounded-full px-3.5 text-[13.5px] font-bold', !userId ? 'bg-ink text-white' : 'bg-white text-ink-soft shadow-card')}
            >
              Все
            </button>
            {members.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => update({ person: userId === member.id ? null : member.id })}
                className={cn(
                  'flex h-9 shrink-0 items-center gap-2 rounded-full pl-1 pr-3.5 text-[13.5px] font-bold',
                  userId === member.id ? 'bg-ink text-white' : 'bg-white text-ink-soft shadow-card',
                )}
              >
                <MemberAvatar member={member} size="xs" /> {member.name.split(' ')[0]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="max-w-full overflow-x-auto scrollbar-none">
              <SegmentedControl size="sm" segments={OUTCOME_FILTERS} value={outcome} onChange={(value) => update({ outcome: value === 'all' ? null : value })} />
            </div>
            <SegmentedControl size="sm" segments={[...PERIOD_FILTERS]} value={period} onChange={(value) => update({ days: value === '30' ? null : value })} />
            <label className="relative min-w-[200px] flex-1 lg:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по цели и итогу" className="h-9 rounded-full bg-white pl-9" />
            </label>
          </div>
        </div>
      </PageHeader>

      <div className="flex flex-col gap-6">
        {outcome === 'all' && !q && <LiveWork />}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 px-4 md:grid-cols-2 lg:px-0">
            {Array.from({ length: 4 }, (_, index) => <div key={index} className="skeleton h-48 rounded-card" />)}
          </div>
        ) : !sessions.length ? (
          <EmptyState
            icon={NotebookPen}
            title="Здесь появится работа команды"
            description="Подключите Claude Code или Codex — каждая работа через агента попадёт сюда: запросы, шаги, результаты, плюсы и минусы."
            action={<Button asChild><Link to={PATHS.agents}><Bot /> Подключить агента</Link></Button>}
          />
        ) : (
          <>
            {days.map((day) => (
              <section key={day.date} className="flex flex-col gap-3">
                <h2 className="px-4 text-[13px] font-bold uppercase tracking-[0.08em] text-ink-faint lg:px-0">
                  {dayTitle(day.date)} · {pluralize(day.items.length, WORK_FORMS)}
                </h2>
                <div className="grid grid-cols-1 gap-3 px-4 md:grid-cols-2 lg:px-0 xl:grid-cols-3">
                  {day.items.map((session) => <WorkCard key={session.id} session={session} />)}
                </div>
              </section>
            ))}
            {total > sessions.length && (
              <div className="flex flex-col items-center gap-2 pb-4">
                {limit < FEED_MAX ? (
                  <Button variant="soft" onClick={() => setLimit((value) => Math.min(value + PAGE_SIZE, FEED_MAX))}>
                    Показать ещё
                  </Button>
                ) : (
                  <p className="text-[13px] text-ink-muted">Показаны последние {FEED_MAX} — сузьте период или выберите человека.</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
