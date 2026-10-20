import { ArrowDownUp, Clapperboard, Search, UserRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { AssetSort, AssetTag } from '@/api/models';
import { AdaptivePicker } from '@/components/common/AdaptivePicker';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import type { TKindFilter, useLibraryFilters } from '../hooks/useLibraryFilters';

const KIND_SEGMENTS: Array<{ value: TKindFilter; label: string }> = [
  { value: 'all', label: 'Все' },
  { value: 'image', label: 'Фото' },
  { value: 'video', label: 'Видео' },
  { value: 'audio', label: 'Аудио' },
  { value: 'document', label: 'Документы' },
];

const SORT_OPTIONS: Array<{ value: AssetSort; label: string }> = [
  { value: 'newest', label: 'Сначала новые' },
  { value: 'oldest', label: 'Сначала старые' },
  { value: 'largest', label: 'Сначала большие' },
  { value: 'smallest', label: 'Сначала маленькие' },
  { value: 'name', label: 'По названию' },
];

const SEARCH_DEBOUNCE_MS = 300;

interface ILibraryFiltersProps {
  filters: ReturnType<typeof useLibraryFilters>;
  tags: AssetTag[];
}

/** Поиск, вид файла, метки, «мои» и сортировка медиатеки. */
export const LibraryFilters = ({ filters, tags }: ILibraryFiltersProps) => {
  const [query, setQuery] = useState(filters.query);
  const debounced = useDebounce(query, SEARCH_DEBOUNCE_MS);
  const { setQuery: applyQuery } = filters;

  useEffect(() => {
    applyQuery(debounced.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- поиск применяется по паузе в наборе
  }, [debounced]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1 lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Название или имя файла" className="bg-white pl-9 shadow-card lg:bg-white" />
        </div>
        <SegmentedControl segments={KIND_SEGMENTS} value={filters.kind} onChange={filters.setKind} size="sm" className="max-w-full overflow-x-auto scrollbar-none" />
        <Button variant={filters.mine ? 'primary' : 'white'} size="sm" onClick={() => filters.setMine(!filters.mine)}>
          <UserRound /> Мои
        </Button>
        <Button variant={filters.pipeline ? 'primary' : 'white'} size="sm" onClick={() => filters.setPipeline(!filters.pipeline)}>
          <Clapperboard /> Конвейер
        </Button>
        <AdaptivePicker
          title="Сортировка"
          options={SORT_OPTIONS}
          selected={filters.sort}
          onSelect={filters.setSort}
          align="end"
          trigger={
            <Button variant="white" size="sm">
              <ArrowDownUp /> {SORT_OPTIONS.find((option) => option.value === filters.sort)?.label}
            </Button>
          }
        />
        {filters.active && (
          <Button variant="ghost" size="sm" onClick={() => { setQuery(''); filters.reset(); }}>
            <X /> Сбросить
          </Button>
        )}
      </div>
      {tags.length > 0 && (
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 scrollbar-none lg:mx-0 lg:flex-wrap lg:px-0">
          {tags.map((tag) => {
            const active = filters.tag === tag.tag;
            return (
              <button
                key={tag.tag}
                type="button"
                onClick={() => filters.setTag(active ? null : tag.tag)}
                className={cn(
                  'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold transition-colors',
                  active ? 'bg-ink text-white' : 'bg-white text-ink-soft shadow-card hover:text-ink',
                )}
              >
                #{tag.tag}
                <span className={cn('tabular text-[11.5px]', active ? 'text-white/70' : 'text-ink-faint')}>{tag.count}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
