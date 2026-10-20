import { Archive, ArchiveRestore, Loader2, Plus } from 'lucide-react';
import { useState } from 'react';

import type { KnowledgeSection } from '@/api/models';
import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ColorSwatches } from '@/features/settings/ColorSwatches';
import { TRACKER_PALETTE } from '@/lib/tracker';
import { cn } from '@/lib/utils';
import { useKnowledgeActions } from '../hooks/useKnowledgeActions';
import { SECTION_ICONS } from '../lib/knowledgeMeta';
import { SectionIcon } from './KnowledgeBadges';

interface ISectionsManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sections: KnowledgeSection[];
}

/** Латиница из названия — подсказка ключа раздела для агентов. */
const keyFrom = (title: string): string =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 32);

/**
 * Разделы базы знаний (администратор): добавить направление, убрать в архив,
 * вернуть. Ключ раздела агенты используют в MCP — после создания он не меняется.
 */
export const SectionsManager = ({ open, onOpenChange, sections }: ISectionsManagerProps) => {
  const actions = useKnowledgeActions();
  const [title, setTitle] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('BookOpen');
  const [color, setColor] = useState<string>(TRACKER_PALETTE[0]!);

  const create = async () => {
    const created = await actions.createSection({ key: key || keyFrom(title), title: title.trim(), description: description.trim(), icon, color });
    if (created) {
      setTitle('');
      setKey('');
      setDescription('');
    }
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} title="Разделы базы знаний" showTitle desktopClassName="max-w-[680px]" mobileClassName="h-[90dvh]">
      <div className="flex max-h-[78vh] flex-col gap-5 overflow-y-auto px-5 pb-5 pt-1 lg:px-6">
        <ul className="flex flex-col divide-y divide-black/[0.05]">
          {sections.map((section) => (
            <li key={section.id} className={cn('flex items-center gap-3 py-2.5', section.archived && 'opacity-50')}>
              <SectionIcon section={section} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14.5px] font-bold text-ink">{section.title} <span className="font-mono text-[12px] font-semibold text-ink-faint">{section.key}</span></div>
                <div className="truncate text-[12.5px] text-ink-muted">{section.description || 'без описания'} · записей {section.entries}</div>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => void actions.updateSection(section.id, { archived: !section.archived })}
                aria-label={section.archived ? 'Вернуть раздел' : 'Убрать раздел в архив'}
                title={section.archived ? 'Вернуть раздел' : 'В архив'}
              >
                {section.archived ? <ArchiveRestore /> : <Archive />}
              </Button>
            </li>
          ))}
        </ul>

        <section className="flex flex-col gap-3 rounded-card bg-panel p-4">
          <h3 className="text-[14px] font-bold text-ink">Новый раздел</h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Input value={title} onChange={(event) => { setTitle(event.target.value); if (!key) setKey(''); }} placeholder="Название: SEO" className="bg-white" />
            <Input value={key} onChange={(event) => setKey(event.target.value.toLowerCase())} placeholder={`Ключ для агентов: ${keyFrom(title) || 'seo'}`} className="bg-white font-mono" />
          </div>
          <Input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Что сюда класть" className="bg-white" />
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(SECTION_ICONS).map(([name, Icon]) => (
              <button
                key={name}
                type="button"
                onClick={() => setIcon(name)}
                aria-pressed={icon === name}
                className={cn('inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-colors', icon === name ? 'border-ink bg-ink text-white' : 'border-black/[0.08] bg-white text-ink-soft hover:border-black/20')}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
          <ColorSwatches value={color} onChange={setColor} />
          <Button className="self-start" onClick={() => void create()} disabled={!title.trim() || actions.saving}>
            {actions.saving ? <Loader2 className="animate-spin" /> : <Plus />} Добавить раздел
          </Button>
        </section>
      </div>
    </ResponsiveDialog>
  );
};
