import { Bot, Pin } from 'lucide-react';

import type { KnowledgeEntry, KnowledgeSection } from '@/api/models';
import { useMembers } from '@/hooks/useDirectory';
import { timeAgo } from '@/lib/dates';
import { plainPreview } from '../lib/knowledgeMeta';
import { KindPill, SectionIcon } from './KnowledgeBadges';

interface IKnowledgeCardProps {
  entry: KnowledgeEntry;
  section: KnowledgeSection | undefined;
  /** Подпись раздела — в «Всех разделах» и поиске. */
  showSection: boolean;
  onOpen: (id: string) => void;
}

/** Запись в списке: суть, вид, начало текста, метки, откуда и насколько ей пользуются агенты. */
export const KnowledgeCard = ({ entry, section, showSection, onOpen }: IKnowledgeCardProps) => {
  const { map: members } = useMembers();
  const author = members.get(entry.createdById);
  const preview = plainPreview(entry.body);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen(entry.id)}
      onKeyDown={(event) => event.key === 'Enter' && onOpen(entry.id)}
      className="card-surface group flex cursor-pointer flex-col gap-2.5 p-4 transition-shadow hover:shadow-float lg:p-5"
    >
      <header className="flex flex-wrap items-center gap-2">
        {showSection && section && (
          <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-ink-muted">
            <SectionIcon section={section} size="sm" /> {section.title}
          </span>
        )}
        <KindPill kind={entry.kind} />
        {entry.pinned && (
          <span className="inline-flex items-center gap-1 text-[11.5px] font-bold text-brand-800" title="Закреплено: агенты получают в начале каждой работы">
            <Pin className="h-3.5 w-3.5" /> закреплено
          </span>
        )}
      </header>

      <h3 className="text-[15.5px] font-bold leading-snug text-ink">{entry.title}</h3>
      {preview && <p className="line-clamp-3 text-[13.5px] leading-snug text-ink-muted">{preview}</p>}

      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {entry.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-secondary px-2 py-0.5 text-[11.5px] font-semibold text-ink-soft">#{tag}</span>
          ))}
        </div>
      )}

      <footer className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-black/[0.05] pt-2.5 text-[12px] text-ink-faint">
        {entry.source.client ? (
          <span className="inline-flex items-center gap-1 font-semibold text-ink-muted">
            <Bot className="h-3.5 w-3.5 text-brand-800" /> агент · {author?.name.split(' ')[0] ?? 'участник'}
          </span>
        ) : (
          <span className="font-semibold text-ink-muted">{author?.name ?? 'Участник'}</span>
        )}
        {entry.source.taskKey && <span className="font-mono">{entry.source.taskKey}</span>}
        <span>{timeAgo(entry.updatedAt)}</span>
        {entry.usageCount > 0 && <span className="ml-auto" title="Сколько раз агенты взяли запись в работу">в работе ×{entry.usageCount}</span>}
      </footer>
    </article>
  );
};
