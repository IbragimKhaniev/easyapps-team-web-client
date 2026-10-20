import type { LucideIcon } from 'lucide-react';

import type { JournalReviewItem } from '@/api/models';
import { Card } from '@/components/common/Card';
import { useMembers } from '@/hooks/useDirectory';
import { formatDateTime } from '@/lib/dates';
import { cn } from '@/lib/utils';
import { useWorkParam } from '../hooks/useWorkParam';

interface IReviewItemsCardProps {
  title: string;
  icon: LucideIcon;
  /** Цвет значка и счётчика. */
  tone: string;
  items: JournalReviewItem[];
  empty: string;
}

/** Плюсы, минусы или вопросы периода: текст, кто и где — нажатие открывает работу. */
export const ReviewItemsCard = ({ title, icon: Icon, tone, items, empty }: IReviewItemsCardProps) => {
  const { map: members } = useMembers();
  const { openWork } = useWorkParam();

  return (
    <Card
      title={(
        <span className="flex items-center gap-2">
          <span className={cn('inline-flex h-7 w-7 items-center justify-center rounded-full', tone)}>
            <Icon className="h-4 w-4" />
          </span>
          {title}
          <span className="text-[14px] font-semibold text-ink-faint">{items.length}</span>
        </span>
      )}
      className="h-full"
    >
      {items.length ? (
        <ul className="-mx-2 flex max-h-[520px] flex-col overflow-y-auto">
          {items.map((item) => (
            <li key={`${item.sessionId}-${item.source}-${item.text}`}>
              <button
                type="button"
                onClick={() => openWork(item.sessionId)}
                className="w-full rounded-2xl px-2 py-2.5 text-left transition-colors hover:bg-secondary"
              >
                <span className="block text-[14px] leading-snug text-ink">{item.text}</span>
                <span className="mt-1 block text-[12px] text-ink-faint">
                  {members.get(item.userId)?.name ?? 'Участник'}
                  {item.taskKey ? ` · ${item.taskKey} ${item.taskTitle ?? ''}` : ''}
                  {` · ${formatDateTime(item.at)}`}
                  {item.source === 'summary' ? ' · из итога' : ''}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl bg-secondary px-4 py-6 text-center text-[13px] text-ink-muted">{empty}</p>
      )}
    </Card>
  );
};
