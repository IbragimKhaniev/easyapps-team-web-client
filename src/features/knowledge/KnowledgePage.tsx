import { BookOpen, FolderCog, Pin, Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { useListKnowledgeEntries, useListKnowledgeSections, useListKnowledgeTags } from '@/api/generated/knowledge/knowledge';
import type { KnowledgeSection, ListKnowledgeEntriesParams } from '@/api/models';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import { useIsDesktop, useMediaQuery } from '@/hooks/useMediaQuery';
import { useSession } from '@/hooks/useSession';
import { cn } from '@/lib/utils';
import { KindPill, SectionIcon } from './components/KnowledgeBadges';
import { KnowledgeCard } from './components/KnowledgeCard';
import { KnowledgeEditor } from './components/KnowledgeEditor';
import { KnowledgeEntrySheet } from './components/KnowledgeEntrySheet';
import { SectionsManager } from './components/SectionsManager';
import { ALL_SECTIONS, PINNED_SECTION, useKnowledgeParams } from './hooks/useKnowledgeParams';
import { KIND_ORDER } from './lib/knowledgeMeta';

const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 60;
const KNOWLEDGE_REFRESH_MS = 30_000;
/** Меток над списком — самые частые; остальные находятся поиском. */
const TAGS_VISIBLE = 16;
/** Колонке разделов нужно ~256px: на узком компьютере (1024–1279) — лента чипов, как на телефоне. */
const SECTIONS_COLUMN_QUERY = '(min-width: 1280px)';

interface ISectionsNavProps {
  sections: KnowledgeSection[];
  active: string;
  pinnedTotal: number;
  total: number;
  onSelect: (key: string) => void;
}

const navRow = (active: boolean) => cn(
  'flex w-full items-center gap-2.5 rounded-2xl px-2.5 py-2 text-left text-[14px] transition-colors',
  active ? 'bg-white font-bold text-ink shadow-card' : 'font-medium text-ink-soft hover:bg-white/70',
);

/** Разделы: на широком экране — колонкой слева, иначе — лентой чипов. */
const SectionsNav = ({ sections, active, pinnedTotal, total, onSelect }: ISectionsNavProps) => {
  const asColumn = useMediaQuery(SECTIONS_COLUMN_QUERY);
  if (!asColumn) {
    return (
      <div className="flex gap-2 overflow-x-auto px-4 scrollbar-none lg:px-0">
        {[{ key: ALL_SECTIONS, title: 'Все' }, { key: PINNED_SECTION, title: 'Закреплённое' }, ...sections].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onSelect(item.key)}
            className={cn('h-9 shrink-0 rounded-full px-3.5 text-[13.5px] font-bold', active === item.key ? 'bg-ink text-white' : 'bg-white text-ink-soft shadow-card')}
          >
            {item.title}
          </button>
        ))}
      </div>
    );
  }
  return (
    <nav className="flex flex-col gap-0.5 rounded-card bg-panel p-2">
      <button type="button" onClick={() => onSelect(ALL_SECTIONS)} className={navRow(active === ALL_SECTIONS)}>
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-ink text-white"><BookOpen className="h-3.5 w-3.5" /></span>
        <span className="flex-1">Все разделы</span>
        <span className="text-[12px] text-ink-faint">{total}</span>
      </button>
      <button type="button" onClick={() => onSelect(PINNED_SECTION)} className={navRow(active === PINNED_SECTION)}>
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-brand-800"><Pin className="h-3.5 w-3.5" /></span>
        <span className="flex-1">Закреплённое</span>
        <span className="text-[12px] text-ink-faint">{pinnedTotal}</span>
      </button>
      <div className="my-1.5 h-px bg-black/[0.06]" />
      {sections.map((section) => (
        <button key={section.id} type="button" onClick={() => onSelect(section.key)} className={navRow(active === section.key)} title={section.description}>
          <SectionIcon section={section} size="sm" />
          <span className="min-w-0 flex-1 break-words leading-snug">{section.title}</span>
          <span className="text-[12px] text-ink-faint">{section.entries}</span>
        </button>
      ))}
    </nav>
  );
};

/**
 * База знаний: важное, что нужно в следующих работах сразу, — по
 * направлениям. Пишут люди и агенты; агенты получают закреплённое и найденное
 * по теме в начале каждой работы.
 */
export const KnowledgePage = () => {
  const isDesktop = useIsDesktop();
  const { isAdmin } = useSession();
  const { section, kind, q, tag, entryId, update, openEntry, closeEntry } = useKnowledgeParams();
  const [query, setQuery] = useState(q);
  const debounced = useDebounce(query.trim(), SEARCH_DEBOUNCE_MS);
  const [creating, setCreating] = useState(false);
  const [managing, setManaging] = useState(false);

  useEffect(() => {
    update({ q: debounced || null });
  }, [debounced, update]);

  const { data: sectionsData } = useListKnowledgeSections(isAdmin ? { includeArchived: 'true' } : undefined, { query: { refetchInterval: KNOWLEDGE_REFRESH_MS } });
  const allSections = useMemo(() => sectionsData?.data ?? [], [sectionsData]);
  const sections = useMemo(() => allSections.filter((item) => !item.archived), [allSections]);
  const current = sections.find((item) => item.key === section);
  const specific = section !== ALL_SECTIONS && section !== PINNED_SECTION;

  const params: ListKnowledgeEntriesParams = {
    ...(specific ? { section } : {}),
    ...(section === PINNED_SECTION ? { pinned: 'true' } : {}),
    ...(kind ? { kind } : {}),
    ...(q ? { q } : {}),
    ...(tag ? { tag } : {}),
    limit: PAGE_SIZE,
  };
  const { data, isLoading } = useListKnowledgeEntries(params, { query: { refetchInterval: KNOWLEDGE_REFRESH_MS, placeholderData: (previous) => previous } });
  const entries = data?.data ?? [];
  const { data: tagsData } = useListKnowledgeTags(specific ? { section } : undefined);
  const tags = (tagsData?.data ?? []).slice(0, TAGS_VISIBLE);

  const total = sections.reduce((sum, item) => sum + item.entries, 0);
  const pinnedTotal = sections.reduce((sum, item) => sum + item.pinned, 0);
  const title = section === PINNED_SECTION ? 'Закреплённое' : current?.title ?? 'База знаний';
  const subtitle = section === PINNED_SECTION
    ? 'Правила, которые агенты получают в начале каждой работы.'
    : current?.description ?? 'Важное, что нужно в следующих работах сразу: правила, выводы, цифры, инструкции. Пишут люди и агенты.';

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={(
          <>
            {isAdmin && isDesktop && (
              <Button variant="outline" size="lg" onClick={() => setManaging(true)}><FolderCog /> Разделы</Button>
            )}
            <Button size={isDesktop ? 'lg' : 'sm'} onClick={() => setCreating(true)}><Plus /> Запись</Button>
          </>
        )}
      />

      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:gap-5">
        <aside className="xl:w-64 xl:shrink-0">
          <SectionsNav sections={sections} active={section} pinnedTotal={pinnedTotal} total={total} onSelect={(key) => update({ section: key === ALL_SECTIONS ? null : key, tag: null })} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-col gap-2.5 px-4 lg:px-0">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти: «модерация видео», «тон постов», «CPL»" className="h-11 rounded-full bg-white pl-10" />
            </label>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
              <button type="button" onClick={() => update({ kind: null })} className={cn('h-8 shrink-0 rounded-full px-3 text-[12.5px] font-bold', !kind ? 'bg-ink text-white' : 'bg-white text-ink-soft shadow-card')}>
                Все виды
              </button>
              {KIND_ORDER.map((value) => (
                <button key={value} type="button" onClick={() => update({ kind: kind === value ? null : value })} className={cn('shrink-0 rounded-full', kind === value && 'ring-2 ring-ink ring-offset-1')}>
                  <KindPill kind={value} className="h-8 px-3 text-[12.5px]" />
                </button>
              ))}
            </div>
            {tags.length > 0 && (
              <div className={cn('flex gap-1.5', isDesktop ? 'flex-wrap' : 'overflow-x-auto scrollbar-none')}>
                {tags.map((item) => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => update({ tag: tag === item.tag ? null : item.tag })}
                    className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-[12px] font-semibold', tag === item.tag ? 'bg-brand-600 text-white' : 'bg-secondary text-ink-soft hover:bg-ink/[0.08]')}
                  >
                    #{item.tag} <span className="opacity-60">{item.count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-3 px-4 md:grid-cols-2 lg:px-0">
              {Array.from({ length: 4 }, (_, index) => <div key={index} className="skeleton h-44 rounded-card" />)}
            </div>
          ) : entries.length ? (
            <div className="grid grid-cols-1 gap-3 px-4 md:grid-cols-2 lg:px-0">
              {entries.map((entry) => (
                <KnowledgeCard key={entry.id} entry={entry} section={allSections.find((item) => item.id === entry.sectionId)} showSection={!specific} onOpen={openEntry} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={BookOpen}
              title={q || kind || tag ? 'Ничего не нашлось' : 'Здесь пока пусто'}
              description={q || kind || tag
                ? 'Попробуйте другие слова или снимите фильтры.'
                : 'Агенты заносят сюда выводы по итогам работ сами. Можно добавить и руками: правило, вывод, цифры, инструкцию.'}
              action={<Button onClick={() => setCreating(true)}><Plus /> Запись</Button>}
            />
          )}
        </div>
      </div>

      <KnowledgeEntrySheet entryId={entryId} sections={allSections} onClose={closeEntry} />
      {creating && (
        <KnowledgeEditor
          open={creating}
          onOpenChange={setCreating}
          sections={sections}
          defaultSectionKey={specific ? section : undefined}
          onSaved={(entry) => openEntry(entry.id)}
        />
      )}
      {managing && <SectionsManager open={managing} onOpenChange={setManaging} sections={allSections} />}
    </div>
  );
};
