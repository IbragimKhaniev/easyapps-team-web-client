import { CircleHelp, Clock, Sparkles, Trash2, TriangleAlert } from 'lucide-react';
import { useState } from 'react';

import type { JournalSession } from '@/api/models';
import { MemberAvatar } from '@/components/common/MemberAvatar';
import { Button } from '@/components/ui/button';
import { useTaskParam } from '@/features/tasks/hooks/useTaskParam';
import { useMembers } from '@/hooks/useDirectory';
import { useSession } from '@/hooks/useSession';
import { formatTime, timeAgo } from '@/lib/dates';
import { PROMPT_FORMS, pluralize, STEP_FORMS } from '@/lib/plural';
import { cn } from '@/lib/utils';
import { useWorkParam } from '../hooks/useWorkParam';
import { ENTRY_KIND_META, formatMinutes, isConversationOnly } from '../lib/journalMeta';
import { DeleteWorkDialog } from './DeleteWorkDialog';
import { AgentBadge, WorkPill } from './WorkBadges';

interface IWorkCardProps {
  session: JournalSession;
  /** Без человека — в карточке задачи и у себя. */
  hidePerson?: boolean;
  /** Без задачи — когда карточка уже внутри задачи. */
  hideTask?: boolean;
}

const Counter = ({ icon: Icon, value, tone, title }: { icon: typeof Clock; value: number; tone: string; title: string }) =>
  (value ? (
    <span className={cn('inline-flex items-center gap-1 text-[12.5px] font-semibold', tone)} title={title}>
      <Icon className="h-3.5 w-3.5" /> {value}
    </span>
  ) : null);

/**
 * Работа в ленте журнала: кто, через какого агента, над какой задачей, чем
 * закончилась — или что делает прямо сейчас. Нажатие открывает ход работы;
 * администратору — ещё корзина (на компьютере — при наведении).
 */
export const WorkCard = ({ session, hidePerson = false, hideTask = false }: IWorkCardProps) => {
  const { map: members } = useMembers();
  const { openWork } = useWorkParam();
  const { openTask } = useTaskParam();
  const { isAdmin } = useSession();
  const [deleting, setDeleting] = useState(false);
  const person = members.get(session.userId);
  const conversation = isConversationOnly(session);
  const live = session.status === 'active';
  const detail = session.summary ?? (live && session.lastEntry ? session.lastEntry : null);

  return (
    <>
      <article
        role="button"
        tabIndex={0}
        onClick={() => openWork(session.id)}
        onKeyDown={(event) => event.key === 'Enter' && openWork(session.id)}
        className={cn(
          'card-surface group flex cursor-pointer flex-col gap-3 p-4 transition-shadow hover:shadow-float lg:p-5',
          conversation && 'opacity-80',
        )}
      >
        <header className="flex items-center gap-2.5">
          {!hidePerson && <MemberAvatar member={person} size="sm" />}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {!hidePerson && <span className="truncate text-[14.5px] font-bold text-ink">{person?.name ?? 'Участник'}</span>}
              <AgentBadge session={session} />
            </div>
            <div className="mt-0.5 text-[12px] text-ink-faint">
              {formatTime(session.startedAt)} · {live ? `активность ${timeAgo(session.lastActivityAt)}` : timeAgo(session.startedAt)}
            </div>
          </div>
          <WorkPill session={session} />
        </header>

        {!hideTask && session.taskKey && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              openTask(session.taskKey!);
            }}
            className="flex w-fit max-w-full items-center gap-2 rounded-xl bg-secondary px-2.5 py-1 text-left text-[13px] hover:bg-ink/[0.08]"
          >
            <span className="shrink-0 whitespace-nowrap font-mono font-semibold text-ink-muted">{session.taskKey}</span>
            <span className="truncate font-semibold text-ink">{session.taskTitle}</span>
          </button>
        )}

        <div>
          <h3 className="text-[15.5px] font-bold leading-snug text-ink">{conversation ? `Разговор: ${session.title}` : session.title}</h3>
          {detail && (
            <p className="mt-1 line-clamp-2 text-[13.5px] leading-snug text-ink-muted">
              {typeof detail === 'string' ? detail : `${ENTRY_KIND_META[detail.kind].label}: ${detail.text}`}
            </p>
          )}
        </div>

        {(session.pluses[0] || session.minuses[0]) && (
          <div className="flex flex-col gap-1.5 text-[13px] leading-snug">
            {session.pluses[0] && (
              <span className="flex gap-2 text-emerald-800"><Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {session.pluses[0]}</span>
            )}
            {session.minuses[0] && (
              <span className="flex gap-2 text-rose-700"><TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {session.minuses[0]}</span>
            )}
          </div>
        )}

        <footer className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-black/[0.05] pt-3">
          <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-ink-muted">
            <Clock className="h-3.5 w-3.5" /> {formatMinutes(session.activeMinutes)}
          </span>
          <span className="text-[12.5px] text-ink-faint">
            {pluralize(session.counts.steps + session.counts.results + session.counts.decisions, STEP_FORMS)}
            {session.counts.prompts ? ` · ${pluralize(session.counts.prompts, PROMPT_FORMS)}` : ''}
          </span>
          <span className="ml-auto flex items-center gap-3">
            <Counter icon={TriangleAlert} value={session.counts.problems} tone="text-rose-600" title="Минусы по ходу" />
            <Counter icon={Sparkles} value={session.counts.wins} tone="text-emerald-700" title="Плюсы по ходу" />
            <Counter icon={CircleHelp} value={session.counts.questions} tone="text-amber-700" title="Вопросы людям" />
            {/* Корзина — внизу, а не в шапке: там она отняла бы место у имени и исхода в узкой колонке. */}
            {isAdmin && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="-my-1.5 -mr-1.5 h-7 w-7 text-ink-faint hover:bg-rose-50 hover:text-rose-600 lg:opacity-0 lg:focus-visible:opacity-100 lg:group-hover:opacity-100"
                aria-label="Удалить работу"
                title="Удалить работу"
                onClick={(event) => {
                  event.stopPropagation();
                  setDeleting(true);
                }}
                onKeyDown={(event) => event.stopPropagation()}
              >
                <Trash2 />
              </Button>
            )}
          </span>
        </footer>
      </article>
      {/* Окно — рядом с карточкой, не внутри: клик в нём всплыл бы до карточки и открыл работу. */}
      {isAdmin && <DeleteWorkDialog open={deleting} onOpenChange={setDeleting} work={session} />}
    </>
  );
};
