import { Bot } from 'lucide-react';

import type { PipelineEvent, TeamMember } from '@/api/models';
import { MemberAvatar } from '@/components/common/MemberAvatar';
import { cn } from '@/lib/utils';
import { parseRef } from '../lib/pipelineMeta';

interface IEventFeedProps {
  events: PipelineEvent[];
  members: Map<string, TeamMember>;
  onOpenRef: (kind: string, key: string) => void;
  /** Группировать по дням (журнал целиком) или списком (последнее). */
  byDay?: boolean;
}

const DAY = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' });
const TIME = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' });

/** Журнал конвейера: решения людей и ход агентов — одной лентой. */
export const EventFeed = ({ events, members, onOpenRef, byDay = false }: IEventFeedProps) => {
  if (!events.length) return <p className="text-[14px] text-ink-faint">Пока пусто.</p>;
  let lastDay = '';
  return (
    <ol className="flex flex-col gap-1">
      {events.map((event) => {
        const day = DAY.format(new Date(event.at));
        const showDay = byDay && day !== lastDay;
        lastDay = day;
        const member = event.userId ? members.get(event.userId) : undefined;
        const ref = parseRef(event.ref);
        const agent = event.who === 'agent';
        return (
          <li key={event.id} className="contents">
            {showDay && <div className="pb-1 pt-4 text-[12px] font-bold uppercase tracking-[0.08em] text-ink-faint first:pt-0">{day}</div>}
            <button
              type="button"
              disabled={!ref}
              onClick={() => ref && onOpenRef(ref.kind, ref.key)}
              className={cn('flex w-full items-start gap-3 rounded-2xl px-2 py-2 text-left', ref && 'hover:bg-secondary')}
            >
              <time className="w-11 shrink-0 pt-0.5 font-mono text-[12px] text-ink-faint">{TIME.format(new Date(event.at))}</time>
              <span className={cn('inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[12px] font-bold', agent ? 'bg-brand-50 text-brand-800' : 'bg-zinc-100 text-ink-soft')}>
                {agent ? <Bot className="h-3.5 w-3.5" /> : member ? <MemberAvatar member={member} size="xs" /> : null}
                {agent ? (event.client?.split(' ')[0] ?? 'агент') : member?.name.split(' ')[0] ?? 'люди'}
              </span>
              <span className="min-w-0 flex-1 text-[14px] text-ink-soft">{event.text}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
};
