import { ArrowRight, Clock, FolderOpen, Link2, Sparkles, Trash2, TriangleAlert, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useGetJournalSession } from '@/api/generated/journal/journal';
import { JournalEntryKind, type JournalEntry } from '@/api/models';
import { workHref } from '@/app/paths';
import { EmptyState } from '@/components/common/EmptyState';
import { MemberAvatar } from '@/components/common/MemberAvatar';
import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { Button } from '@/components/ui/button';
import { useTaskParam } from '@/features/tasks/hooks/useTaskParam';
import { useMembers } from '@/hooks/useDirectory';
import { useLastPresent } from '@/hooks/useLastPresent';
import { useSession } from '@/hooks/useSession';
import { formatDateTime } from '@/lib/dates';
import { useWorkParam } from '../hooks/useWorkParam';
import { formatMinutes, isConversationOnly } from '../lib/journalMeta';
import { DeleteWorkDialog } from './DeleteWorkDialog';
import { AgentBadge, WorkPill } from './WorkBadges';
import { WorkKnowledge } from './WorkKnowledge';
import { WorkTimeline } from './WorkTimeline';

/** Пока работа идёт — ход перечитывается сам. */
const LIVE_REFRESH_MS = 5_000;

type TTimelineFilter = 'all' | 'work' | 'signals';

const FILTERS: Array<{ value: TTimelineFilter; label: string }> = [
  { value: 'all', label: 'Всё' },
  { value: 'work', label: 'Без переписки' },
  { value: 'signals', label: 'Плюсы и минусы' },
];

const CONVERSATION = new Set<JournalEntryKind>([JournalEntryKind.prompt, JournalEntryKind.reply]);
const SIGNALS = new Set<JournalEntryKind>([JournalEntryKind.problem, JournalEntryKind.win, JournalEntryKind.question, JournalEntryKind.result]);

const filterEntries = (entries: JournalEntry[], filter: TTimelineFilter): JournalEntry[] => {
  if (filter === 'work') return entries.filter((entry) => !CONVERSATION.has(entry.kind));
  if (filter === 'signals') return entries.filter((entry) => SIGNALS.has(entry.kind));
  return entries;
};

const SummaryList = ({ title, items, tone, icon: Icon }: { title: string; items: string[]; tone: string; icon: typeof Sparkles }) =>
  (items.length ? (
    <div className="rounded-2xl bg-white/70 p-3.5">
      <div className={`mb-2 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.06em] ${tone}`}>
        <Icon className="h-3.5 w-3.5" /> {title}
      </div>
      <ul className="flex flex-col gap-1.5 text-[13.5px] leading-snug text-ink">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  ) : null);

/** Работа журнала целиком поверх любого экрана: итог, плюсы, минусы, следующие шаги и весь ход. */
export const WorkSheet = () => {
  const { openId, closeWork } = useWorkParam();
  const { openTask } = useTaskParam();
  const { map: members } = useMembers();
  const { isAdmin } = useSession();
  const [filter, setFilter] = useState<TTimelineFilter>('all');
  const [deleting, setDeleting] = useState(false);
  const shownId = useLastPresent(openId);
  const { data, isLoading, isError } = useGetJournalSession(shownId ?? '', {
    query: {
      enabled: Boolean(openId),
      refetchInterval: (query) => (query.state.data?.data.status === 'active' ? LIVE_REFRESH_MS : false),
    },
  });
  const work = data?.data;
  const person = work ? members.get(work.userId) : undefined;
  const entries = useMemo(() => filterEntries(work?.entries ?? [], filter), [work, filter]);

  const copyLink = async () => {
    if (!work) return;
    await navigator.clipboard.writeText(`${window.location.origin}${workHref(work.id)}`);
    toast.success('Ссылка скопирована');
  };

  return (
    <ResponsiveDialog
      open={Boolean(openId)}
      onOpenChange={(open) => !open && closeWork()}
      title={work?.title ?? 'Работа'}
      desktopClassName="h-[min(92vh,900px)] max-w-[820px] overflow-hidden"
      mobileClassName="h-[94dvh]"
    >
      {isLoading ? (
        <div className="flex flex-col gap-4 p-6">
          <div className="skeleton h-6 w-40" />
          <div className="skeleton h-9 w-3/4" />
          <div className="skeleton h-48 w-full" />
        </div>
      ) : isError || !work ? (
        <EmptyState icon={X} title="Работа не найдена" action={<Button onClick={closeWork}>Закрыть</Button>} />
      ) : (
        <div className="flex h-full flex-col">
          <header className="flex flex-wrap items-center gap-2 border-b border-black/[0.06] px-5 py-3 lg:px-6">
            <WorkPill session={work} />
            <AgentBadge session={work} />
            {work.workspace && (
              <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-ink-muted">
                <FolderOpen className="h-3.5 w-3.5" /> {work.workspace}
              </span>
            )}
            <div className="ml-auto flex items-center gap-1">
              <Button variant="ghost" size="icon-sm" onClick={() => void copyLink()} aria-label="Скопировать ссылку" title="Скопировать ссылку">
                <Link2 />
              </Button>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="hover:bg-rose-50 hover:text-rose-600"
                  onClick={() => setDeleting(true)}
                  aria-label="Удалить работу"
                  title="Удалить работу"
                >
                  <Trash2 />
                </Button>
              )}
              <Button variant="soft" size="icon-sm" onClick={closeWork} aria-label="Закрыть">
                <X />
              </Button>
            </div>
            {isAdmin && <DeleteWorkDialog open={deleting} onOpenChange={setDeleting} work={work} onDeleted={closeWork} />}
          </header>

          <div className="flex-1 overflow-y-auto px-5 pb-8 pt-4 lg:px-6">
            <div className="flex items-center gap-2.5">
              <MemberAvatar member={person} size="md" />
              <div className="min-w-0 text-[13px] text-ink-muted">
                <div className="truncate text-[15px] font-bold text-ink">{person?.name ?? 'Участник'}</div>
                {formatDateTime(work.startedAt)}
                {work.finishedAt ? ` → ${formatDateTime(work.finishedAt)}` : ''}
                <span className="ml-2 inline-flex items-center gap-1 font-semibold"><Clock className="h-3.5 w-3.5" /> {formatMinutes(work.activeMinutes)}</span>
              </div>
            </div>

            <h2 className="mt-4 text-[22px] font-extrabold leading-tight tracking-tight text-ink">
              {isConversationOnly(work) ? `Разговор: ${work.title}` : work.title}
            </h2>

            {work.taskKey && (
              <button
                type="button"
                onClick={() => openTask(work.taskKey!)}
                className="mt-3 flex w-full items-center gap-2 rounded-2xl border border-black/[0.07] px-3.5 py-2.5 text-left text-[14px] hover:bg-secondary"
              >
                <span className="shrink-0 whitespace-nowrap font-mono font-semibold text-ink-muted">{work.taskKey}</span>
                <span className="min-w-0 flex-1 truncate font-semibold text-ink">{work.taskTitle}</span>
                <ArrowRight className="h-4 w-4 text-ink-faint" />
              </button>
            )}

            {(work.summary || work.pluses.length > 0 || work.minuses.length > 0 || work.nextSteps.length > 0) && (
              <section className="mt-5 rounded-card bg-panel p-4">
                <div className="mb-1 text-[12px] font-bold uppercase tracking-[0.08em] text-ink-faint">Итог</div>
                {work.summary && <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-ink">{work.summary}</p>}
                <div className="mt-3 grid grid-cols-1 gap-2.5 md:grid-cols-3">
                  <SummaryList title="Плюсы" items={work.pluses} tone="text-emerald-700" icon={Sparkles} />
                  <SummaryList title="Минусы" items={work.minuses} tone="text-rose-600" icon={TriangleAlert} />
                  <SummaryList title="Дальше" items={work.nextSteps} tone="text-brand-800" icon={ArrowRight} />
                </div>
              </section>
            )}

            {work.attachedKnowledge.length > 0 && <WorkKnowledge entries={work.attachedKnowledge} />}

            <section className="mt-6">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-[12px] font-bold uppercase tracking-[0.08em] text-ink-faint">Ход работы</h3>
                <SegmentedControl size="sm" segments={FILTERS} value={filter} onChange={setFilter} />
              </div>
              {entries.length ? (
                <WorkTimeline entries={entries} person={person} />
              ) : (
                <p className="rounded-2xl bg-secondary px-4 py-6 text-center text-[13px] text-ink-muted">Записей такого вида нет.</p>
              )}
              {work.entriesTruncated && <p className="mt-3 text-center text-[12px] text-ink-faint">Показаны первые 2000 записей.</p>}
            </section>
          </div>
        </div>
      )}
    </ResponsiveDialog>
  );
};
