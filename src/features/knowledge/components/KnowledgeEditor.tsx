import { Loader2, Save } from 'lucide-react';
import { useState } from 'react';

import { KnowledgeKind, type KnowledgeEntry, type KnowledgeSection } from '@/api/models';
import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useKnowledgeActions } from '../hooks/useKnowledgeActions';
import { KIND_META, KIND_ORDER, parseTags } from '../lib/knowledgeMeta';
import { SectionIcon } from './KnowledgeBadges';

interface IKnowledgeEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sections: KnowledgeSection[];
  /** Правка записи; без неё — новая. */
  entry?: KnowledgeEntry | null;
  /** Раздел новой записи по умолчанию (ключ). */
  defaultSectionKey?: string;
  onSaved?: (entry: KnowledgeEntry) => void;
}

const fieldLabel = 'mb-1.5 block text-[12px] font-bold uppercase tracking-[0.06em] text-ink-faint';

/** Новая запись или правка: раздел, вид, суть, текст (Markdown), метки, закрепить. */
export const KnowledgeEditor = ({ open, onOpenChange, sections, entry, defaultSectionKey, onSaved }: IKnowledgeEditorProps) => {
  const actions = useKnowledgeActions();
  const initialSection = entry ? sections.find((section) => section.id === entry.sectionId)?.key : defaultSectionKey;
  const [sectionKey, setSectionKey] = useState(initialSection ?? sections[0]?.key ?? '');
  const [kind, setKind] = useState<KnowledgeKind>(entry?.kind ?? KnowledgeKind.insight);
  const [title, setTitle] = useState(entry?.title ?? '');
  const [body, setBody] = useState(entry?.body ?? '');
  const [tags, setTags] = useState(entry?.tags.join(', ') ?? '');
  const [pinned, setPinned] = useState(entry?.pinned ?? false);

  const save = async () => {
    const data = { section: sectionKey, kind, title: title.trim(), body, tags: parseTags(tags), pinned };
    const saved = entry ? await actions.updateEntry(entry.id, data) : await actions.createEntry(data);
    if (saved) {
      onSaved?.(saved);
      onOpenChange(false);
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={entry ? 'Правка записи' : 'Новая запись'}
      showTitle
      desktopClassName="max-w-[720px]"
      mobileClassName="h-[94dvh]"
    >
      <div className="flex max-h-[80vh] flex-col gap-4 overflow-y-auto px-5 pb-5 pt-1 lg:px-6">
        <div>
          <span className={fieldLabel}>Раздел</span>
          <div className="flex flex-wrap gap-1.5">
            {sections.filter((section) => !section.archived).map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setSectionKey(section.key)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-3 text-[13px] font-semibold transition-colors',
                  sectionKey === section.key ? 'border-ink bg-ink text-white' : 'border-black/[0.08] bg-white text-ink-soft hover:border-black/20',
                )}
              >
                <SectionIcon section={section} size="sm" /> {section.title}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className={fieldLabel}>Что это</span>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {KIND_ORDER.map((value) => {
              const meta = KIND_META[value];
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setKind(value)}
                  aria-pressed={kind === value}
                  className={cn(
                    'flex items-start gap-2 rounded-2xl border p-2.5 text-left transition-colors',
                    kind === value ? 'border-brand-300 bg-brand-50/70' : 'border-black/[0.07] hover:border-black/15',
                  )}
                >
                  <meta.icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-800" />
                  <span className="min-w-0">
                    <span className="block text-[13.5px] font-bold text-ink">{meta.label}</span>
                    <span className="block text-[11.5px] leading-snug text-ink-muted">{meta.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <label>
          <span className={fieldLabel}>Суть одной фразой</span>
          <Input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} placeholder="Видео в таргете VK модерируется дольше — запускать за сутки" />
        </label>

        <label>
          <span className={fieldLabel}>Подробности (Markdown)</span>
          <Textarea value={body} onChange={(event) => setBody(event.target.value)} rows={8} placeholder="Контекст, цифры, как применять. Без паролей и токенов." className="font-mono text-[13px]" />
        </label>

        <label>
          <span className={fieldLabel}>Метки через запятую</span>
          <Input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="vk-реклама, модерация, креативы" />
        </label>

        <label className="flex items-center justify-between gap-3 rounded-2xl bg-secondary px-4 py-3">
          <span className="min-w-0">
            <span className="block text-[14px] font-bold text-ink">Закрепить</span>
            <span className="block text-[12.5px] leading-snug text-ink-muted">Агенты будут получать запись в начале каждой работы — для правил, важных всем</span>
          </span>
          <Switch checked={pinned} onCheckedChange={setPinned} />
        </label>

        <div className="flex justify-end gap-2">
          <Button variant="soft" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button onClick={() => void save()} disabled={!title.trim() || !sectionKey || actions.saving}>
            {actions.saving ? <Loader2 className="animate-spin" /> : <Save />} Сохранить
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
};
