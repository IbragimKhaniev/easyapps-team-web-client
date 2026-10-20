import type { KnowledgeKind, KnowledgeSection } from '@/api/models';
import { cn } from '@/lib/utils';
import { KIND_META, sectionIcon } from '../lib/knowledgeMeta';

/** Вид записи: «Правило», «Вывод», «Цифры»… */
export const KindPill = ({ kind, className }: { kind: KnowledgeKind; className?: string }) => {
  const meta = KIND_META[kind];
  return (
    <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11.5px] font-bold', meta.chip, className)}>
      <meta.icon className="h-3 w-3" /> {meta.label}
    </span>
  );
};

/** Значок раздела в его цвете. */
export const SectionIcon = ({ section, size = 'md' }: { section: Pick<KnowledgeSection, 'icon' | 'color'>; size?: 'sm' | 'md' | 'lg' }) => {
  const Icon = sectionIcon(section.icon);
  const box = { sm: 'h-7 w-7 rounded-lg', md: 'h-9 w-9 rounded-xl', lg: 'h-12 w-12 rounded-2xl' }[size];
  const glyph = { sm: 'h-3.5 w-3.5', md: 'h-[18px] w-[18px]', lg: 'h-6 w-6' }[size];
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center', box)} style={{ background: `${section.color}1F`, color: section.color }}>
      <Icon className={glyph} />
    </span>
  );
};
