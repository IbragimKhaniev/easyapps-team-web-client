import { ArrowRight, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useListJournalSessions } from '@/api/generated/journal/journal';
import { PATHS } from '@/app/paths';
import { Card } from '@/components/common/Card';
import { MemberAvatar } from '@/components/common/MemberAvatar';
import { useWorkParam } from '@/features/agents/hooks/useWorkParam';
import { ENTRY_KIND_META } from '@/features/agents/lib/journalMeta';
import { useMembers } from '@/hooks/useDirectory';
import { todayIso, timeAgo } from '@/lib/dates';
import { pluralize, WORK_FORMS } from '@/lib/plural';

const LIVE_REFRESH_MS = 15_000;
const LIVE_SHOWN = 4;

/** Сводка: кто сейчас работает через агента и что делает; сколько работ сегодня. */
export const AgentsNowCard = () => {
  const { map: members } = useMembers();
  const { openWork } = useWorkParam();
  const today = todayIso();
  const { data: live } = useListJournalSessions({ status: 'active', limit: LIVE_SHOWN }, { query: { refetchInterval: LIVE_REFRESH_MS } });
  const { data: todayData } = useListJournalSessions({ from: today, to: today, limit: 1 }, { query: { refetchInterval: LIVE_REFRESH_MS } });
  const sessions = live?.data ?? [];
  const activeTotal = live?.pagination.totalItems ?? 0;
  const todayTotal = todayData?.pagination.totalItems ?? 0;

  return (
    <Card
      title="Агенты сейчас"
      action={<Link to={PATHS.journal} className="text-[13px] font-semibold text-brand-800 hover:underline">Журнал</Link>}
      className="h-full"
    >
      {sessions.length ? (
        <ul className="-mx-2 flex flex-col">
          {sessions.map((session) => {
            const person = members.get(session.userId);
            return (
              <li key={session.id}>
                <button type="button" onClick={() => openWork(session.id)} className="flex w-full items-start gap-3 rounded-2xl px-2 py-2 text-left hover:bg-secondary">
                  <MemberAvatar member={person} size="sm" className="mt-0.5" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-bold text-ink">
                      {person?.name.split(' ')[0] ?? 'Участник'}
                      <span className="font-semibold text-ink-muted"> · {session.taskKey ?? 'разговор'}</span>
                    </span>
                    <span className="block truncate text-[12.5px] text-ink-muted">
                      {session.lastEntry ? `${ENTRY_KIND_META[session.lastEntry.kind].label}: ${session.lastEntry.text}` : session.title}
                    </span>
                  </span>
                  <span className="shrink-0 text-[11.5px] text-ink-faint">{timeAgo(session.lastActivityAt)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl bg-secondary px-4 py-4">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-800 shadow-card">
            <Bot className="h-5 w-5" />
          </span>
          <span className="text-[13.5px] leading-snug text-ink-muted">Сейчас никто не работает через агента.</span>
        </div>
      )}
      <Link to={PATHS.journal} className="mt-3 flex items-center justify-between border-t border-black/[0.05] pt-3 text-[13px] text-ink-muted hover:text-ink">
        <span>
          Сегодня — {pluralize(todayTotal, WORK_FORMS)}
          {activeTotal > LIVE_SHOWN ? ` · ещё ${activeTotal - LIVE_SHOWN} в работе` : ''}
        </span>
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Card>
  );
};
