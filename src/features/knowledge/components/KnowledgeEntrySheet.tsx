import { Archive, ArchiveRestore, ArrowRight, Bot, ExternalLink, Link2, Pencil, Pin, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { useGetKnowledgeEntry } from '@/api/generated/knowledge/knowledge';
import type { KnowledgeSection } from '@/api/models';
import { knowledgeHref } from '@/app/paths';
import { EmptyState } from '@/components/common/EmptyState';
import { Markdown } from '@/components/common/Markdown';
import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import { Button } from '@/components/ui/button';
import { useWorkParam } from '@/features/agents/hooks/useWorkParam';
import { useTaskParam } from '@/features/tasks/hooks/useTaskParam';
import { useMembers } from '@/hooks/useDirectory';
import { useLastPresent } from '@/hooks/useLastPresent';
import { useSession } from '@/hooks/useSession';
import { formatDateTime } from '@/lib/dates';
import { pluralize, TIMES_FORMS } from '@/lib/plural';
import { useKnowledgeActions } from '../hooks/useKnowledgeActions';
import { KindPill, SectionIcon } from './KnowledgeBadges';
import { KnowledgeEditor } from './KnowledgeEditor';

interface IKnowledgeEntrySheetProps {
  entryId: string | null;
  sections: KnowledgeSection[];
  onClose: () => void;
}

/** Запись базы знаний целиком: текст, откуда пришла, кто писал; править, закрепить, в архив. */
export const KnowledgeEntrySheet = ({ entryId, sections, onClose }: IKnowledgeEntrySheetProps) => {
  const shownId = useLastPresent(entryId);
  const { data, isLoading, isError } = useGetKnowledgeEntry(shownId ?? '', { query: { enabled: Boolean(entryId) } });
  const { map: members } = useMembers();
  const { user, isAdmin } = useSession();
  const { openTask } = useTaskParam();
  const { openWork } = useWorkParam();
  const actions = useKnowledgeActions();
  const [editing, setEditing] = useState(false);
  const entry = data?.data;
  const section = entry ? sections.find((item) => item.id === entry.sectionId) : undefined;
  const canArchive = Boolean(entry && (isAdmin || entry.createdById === user?.id));

  const copyLink = async () => {
    if (!entry) return;
    await navigator.clipboard.writeText(`${window.location.origin}${knowledgeHref(entry.id)}`);
    toast.success('Ссылка скопирована');
  };

  return (
    <>
      <ResponsiveDialog
        open={Boolean(entryId)}
        onOpenChange={(open) => !open && onClose()}
        title={entry?.title ?? 'Запись базы знаний'}
        desktopClassName="h-[min(90vh,820px)] max-w-[760px] overflow-hidden"
        mobileClassName="h-[92dvh]"
      >
        {isLoading ? (
          <div className="flex flex-col gap-4 p-6">
            <div className="skeleton h-6 w-40" />
            <div className="skeleton h-9 w-3/4" />
            <div className="skeleton h-48 w-full" />
          </div>
        ) : isError || !entry ? (
          <EmptyState icon={X} title="Запись не найдена" action={<Button onClick={onClose}>Закрыть</Button>} />
        ) : (
          <div className="flex h-full flex-col">
            <header className="flex flex-wrap items-center gap-2 border-b border-black/[0.06] px-5 py-3 lg:px-6">
              {section && (
                <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-ink">
                  <SectionIcon section={section} size="sm" /> {section.title}
                </span>
              )}
              <KindPill kind={entry.kind} />
              {entry.pinned && <span className="inline-flex items-center gap-1 text-[12px] font-bold text-brand-800"><Pin className="h-3.5 w-3.5" /> закреплено</span>}
              {entry.archivedAt && <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[12px] font-bold text-zinc-500">в архиве</span>}
              <div className="ml-auto flex items-center gap-1">
                <Button variant="ghost" size="icon-sm" onClick={() => void copyLink()} aria-label="Скопировать ссылку" title="Скопировать ссылку"><Link2 /></Button>
                {!entry.archivedAt && <Button variant="ghost" size="icon-sm" onClick={() => setEditing(true)} aria-label="Править" title="Править"><Pencil /></Button>}
                <Button variant="soft" size="icon-sm" onClick={onClose} aria-label="Закрыть"><X /></Button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-5 pb-8 pt-4 lg:px-6">
              <h2 className="text-[22px] font-extrabold leading-tight tracking-tight text-ink">{entry.title}</h2>
              {entry.body ? <Markdown className="mt-3">{entry.body}</Markdown> : <p className="mt-3 text-[14px] text-ink-faint">Без подробностей.</p>}

              {entry.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {entry.tags.map((tag) => <span key={tag} className="rounded-full bg-secondary px-2.5 py-0.5 text-[12px] font-semibold text-ink-soft">#{tag}</span>)}
                </div>
              )}

              {entry.links.length > 0 && (
                <div className="mt-4 flex flex-col gap-1.5">
                  {entry.links.map((link) => (
                    <a key={link.url} href={link.url} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-brand-800 hover:underline">
                      <ExternalLink className="h-4 w-4" /> {link.title ?? link.url}
                    </a>
                  ))}
                </div>
              )}

              {(entry.source.taskKey || entry.source.journalSessionId) && (
                <section className="mt-6 flex flex-col gap-2">
                  <h3 className="text-[12px] font-bold uppercase tracking-[0.08em] text-ink-faint">Откуда</h3>
                  {entry.source.taskKey && (
                    <button type="button" onClick={() => openTask(entry.source.taskKey!)} className="flex items-center gap-2 rounded-2xl border border-black/[0.07] px-3.5 py-2.5 text-left text-[14px] hover:bg-secondary">
                      <span className="font-mono font-semibold text-ink-muted">{entry.source.taskKey}</span>
                      <span className="flex-1 text-ink-soft">задача, в работе над которой появилось знание</span>
                      <ArrowRight className="h-4 w-4 text-ink-faint" />
                    </button>
                  )}
                  {entry.source.journalSessionId && (
                    <button type="button" onClick={() => openWork(entry.source.journalSessionId!)} className="flex items-center gap-2 rounded-2xl border border-black/[0.07] px-3.5 py-2.5 text-left text-[14px] hover:bg-secondary">
                      <Bot className="h-4 w-4 text-brand-800" />
                      <span className="flex-1 text-ink-soft">работа в журнале{entry.source.client ? ` · ${entry.source.client}` : ''}</span>
                      <ArrowRight className="h-4 w-4 text-ink-faint" />
                    </button>
                  )}
                </section>
              )}

              <p className="mt-6 text-[12.5px] leading-relaxed text-ink-faint">
                Записал {members.get(entry.createdById)?.name ?? 'участник'} · {formatDateTime(entry.createdAt)}
                {entry.updatedAt !== entry.createdAt ? ` · правил ${members.get(entry.updatedById)?.name ?? 'участник'}, ${formatDateTime(entry.updatedAt)}` : ''}
                {entry.usageCount ? ` · агенты взяли в работу ${pluralize(entry.usageCount, TIMES_FORMS)}` : ''}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {!entry.archivedAt && (
                  <Button variant="soft" size="sm" onClick={() => void actions.updateEntry(entry.id, { pinned: !entry.pinned })}>
                    <Pin /> {entry.pinned ? 'Открепить' : 'Закрепить'}
                  </Button>
                )}
                {canArchive && !entry.archivedAt && (
                  <Button variant="ghost" size="sm" className="text-rose-600" onClick={() => void actions.archiveEntry(entry.id)}>
                    <Archive /> Устарело — в архив
                  </Button>
                )}
                {entry.archivedAt && (
                  <Button variant="soft" size="sm" onClick={() => void actions.restoreEntry(entry.id)}>
                    <ArchiveRestore /> Вернуть из архива
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </ResponsiveDialog>
      {editing && entry && (
        <KnowledgeEditor open={editing} onOpenChange={setEditing} sections={sections} entry={entry} />
      )}
    </>
  );
};
