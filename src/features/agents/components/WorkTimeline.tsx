import { Bot, ExternalLink } from 'lucide-react';

import { JournalEntryKind, type JournalEntry, type TeamMember } from '@/api/models';
import { MemberAvatar } from '@/components/common/MemberAvatar';
import { formatTime } from '@/lib/dates';
import { cn } from '@/lib/utils';
import { ENTRY_KIND_META } from '../lib/journalMeta';
import { MetricChips } from './WorkBadges';

interface IWorkTimelineProps {
  entries: JournalEntry[];
  person: TeamMember | undefined;
}

/** Длинный запрос или ответ сворачивается — раскрывается по нажатию. */
const BUBBLE_PREVIEW = 600;

const LongText = ({ text }: { text: string }) =>
  (text.length > BUBBLE_PREVIEW ? (
    <details className="group">
      <summary className="cursor-pointer list-none whitespace-pre-wrap">
        {text.slice(0, BUBBLE_PREVIEW)}… <span className="font-semibold text-brand-800 group-open:hidden">ещё</span>
      </summary>
      <span className="whitespace-pre-wrap">{text.slice(BUBBLE_PREVIEW)}</span>
    </details>
  ) : (
    <span className="whitespace-pre-wrap">{text}</span>
  ));

const Links = ({ entry }: { entry: JournalEntry }) =>
  (entry.links.length ? (
    <div className="mt-1.5 flex flex-wrap gap-2">
      {entry.links.map((link) => (
        <a key={link.url} href={link.url} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-800 hover:underline">
          <ExternalLink className="h-3.5 w-3.5" /> {link.title ?? link.url}
        </a>
      ))}
    </div>
  ) : null);

/**
 * Ход работы по времени: запросы человека и ответы агента — пузырями, шаги,
 * решения, результаты, минусы и плюсы — точками с подписью, правки задачи —
 * серой строкой.
 */
export const WorkTimeline = ({ entries, person }: IWorkTimelineProps) => (
  <ol className="flex flex-col gap-3">
    {entries.map((entry) => {
      const meta = ENTRY_KIND_META[entry.kind];

      if (entry.kind === JournalEntryKind.prompt) {
        return (
          <li key={entry.id} className="flex items-start gap-2.5">
            <MemberAvatar member={person} size="xs" className="mt-1" />
            <div className="min-w-0 max-w-[92%] rounded-2xl rounded-tl-md bg-secondary px-3.5 py-2.5 text-[14px] leading-relaxed text-ink">
              <LongText text={entry.text} />
              <div className="mt-1 text-[11.5px] text-ink-faint">{person?.name ?? 'Человек'} · {formatTime(entry.createdAt)}</div>
            </div>
          </li>
        );
      }

      if (entry.kind === JournalEntryKind.reply) {
        return (
          <li key={entry.id} className="flex items-start gap-2.5">
            <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white">
              <Bot className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 max-w-[92%] rounded-2xl rounded-tl-md bg-brand-50 px-3.5 py-2.5 text-[14px] leading-relaxed text-ink">
              <LongText text={entry.text} />
              <div className="mt-1 text-[11.5px] text-brand-900/60">Агент · {formatTime(entry.createdAt)}</div>
            </div>
          </li>
        );
      }

      if (entry.kind === JournalEntryKind.task) {
        return (
          <li key={entry.id} className="flex items-center gap-2 pl-1 text-[12.5px] text-ink-faint">
            <meta.icon className="h-3.5 w-3.5" />
            <span className="min-w-0 truncate">{entry.text}</span>
            <span className="ml-auto shrink-0">{formatTime(entry.createdAt)}</span>
          </li>
        );
      }

      return (
        <li key={entry.id} className="flex items-start gap-3">
          <span className={cn('mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full', meta.dot)}>
            <meta.icon className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2 text-[12px]">
              <span className="font-bold uppercase tracking-[0.06em] text-ink-faint">{meta.label}</span>
              <span className="text-ink-faint">{formatTime(entry.createdAt)}</span>
            </div>
            <p className="mt-0.5 whitespace-pre-wrap text-[14px] leading-relaxed text-ink">{entry.text}</p>
            {entry.metrics.length > 0 && <div className="mt-2"><MetricChips metrics={entry.metrics} /></div>}
            <Links entry={entry} />
          </div>
        </li>
      );
    })}
  </ol>
);
