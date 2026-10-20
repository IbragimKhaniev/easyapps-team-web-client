import type { JournalReviewPerson } from '@/api/models';
import { Card } from '@/components/common/Card';
import { MemberAvatar } from '@/components/common/MemberAvatar';
import { useMembers } from '@/hooks/useDirectory';
import { cn } from '@/lib/utils';
import { formatMinutes } from '../lib/journalMeta';

interface IPeopleCardProps {
  people: JournalReviewPerson[];
  selectedId: string | null;
  onSelect: (userId: string | null) => void;
}

/** Сегменты полосы исходов: доля работ каждого исхода. */
const OUTCOME_SEGMENTS: Array<{ key: keyof Pick<JournalReviewPerson, 'done' | 'progress' | 'blocked' | 'failed' | 'abandoned'>; color: string; label: string }> = [
  { key: 'done', color: 'bg-brand-500', label: 'сделано' },
  { key: 'progress', color: 'bg-amber-400', label: 'продвинулись' },
  { key: 'blocked', color: 'bg-rose-500', label: 'упёрлись' },
  { key: 'failed', color: 'bg-zinc-500', label: 'не получилось' },
  { key: 'abandoned', color: 'bg-zinc-200', label: 'без итога' },
];

/** Люди за период: сколько работали через агентов и чем заканчивались работы. */
export const PeopleCard = ({ people, selectedId, onSelect }: IPeopleCardProps) => {
  const { map: members } = useMembers();

  return (
    <Card title="Люди" className="h-full">
      {people.length ? (
        <ul className="-mx-2 flex flex-col">
          {people.map((person) => {
            const member = members.get(person.userId);
            const closed = person.sessions - person.active;
            return (
              <li key={person.userId}>
                <button
                  type="button"
                  onClick={() => onSelect(selectedId === person.userId ? null : person.userId)}
                  className={cn('flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition-colors hover:bg-secondary', selectedId === person.userId && 'bg-brand-50')}
                >
                  <MemberAvatar member={member} size="md" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-[14.5px] font-bold text-ink">{member?.name ?? 'Участник'}</span>
                      <span className="shrink-0 text-[12.5px] font-semibold text-ink-muted">{formatMinutes(person.activeMinutes)}</span>
                    </span>
                    <span className="mt-1.5 flex h-2 overflow-hidden rounded-full bg-black/[0.05]" title="Исходы работ">
                      {closed > 0 && OUTCOME_SEGMENTS.map((segment) => (person[segment.key] ? (
                        <span key={segment.key} className={segment.color} style={{ width: `${(person[segment.key] / closed) * 100}%` }} title={`${segment.label}: ${person[segment.key]}`} />
                      ) : null))}
                    </span>
                    <span className="mt-1 block text-[12px] text-ink-faint">
                      работ {person.sessions} · сделано {person.done} · упёрлись {person.blocked + person.failed} · без итога {person.abandoned}
                      {' · '}<span className="text-rose-600">минусов {person.problems}</span>{' · '}<span className="text-emerald-700">плюсов {person.wins}</span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-2xl bg-secondary px-4 py-6 text-center text-[13px] text-ink-muted">За период работ нет.</p>
      )}
    </Card>
  );
};
