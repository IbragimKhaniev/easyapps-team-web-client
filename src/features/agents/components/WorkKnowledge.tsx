import { Archive, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { JournalKnowledgeRef } from '@/api/models';
import { knowledgeHref } from '@/app/paths';
import { KIND_META } from '@/features/knowledge/lib/knowledgeMeta';
import { cn } from '@/lib/utils';

/**
 * Знания в работе: записи базы знаний, которые агент подключил к работе
 * (`attach_knowledge`) — видно, на что он опирался. Запись — ссылка в базу знаний.
 */
export const WorkKnowledge = ({ entries }: { entries: JournalKnowledgeRef[] }) => (
  <section className="mt-5">
    <h3 className="mb-2 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.08em] text-ink-faint">
      <BookOpen className="h-3.5 w-3.5" /> Знания в работе · {entries.length}
    </h3>
    <ul className="flex flex-wrap gap-1.5">
      {entries.map((entry) => {
        const meta = KIND_META[entry.kind];
        const Icon = entry.archived ? Archive : meta.icon;
        return (
          <li key={entry.id} className="min-w-0 max-w-full">
            <Link
              to={knowledgeHref(entry.id)}
              title={`${meta.label}${entry.archived ? ' · в архиве' : ''}: ${entry.title}`}
              className={cn(
                'inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-colors hover:brightness-95',
                entry.archived ? 'border-black/[0.08] bg-secondary text-ink-muted line-through decoration-ink-faint/60' : meta.chip,
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{entry.title}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  </section>
);
