import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import type { AssetSort, MediaKind } from '@/api/models';

const KINDS: MediaKind[] = ['image', 'video', 'audio', 'document'];
const SORTS: AssetSort[] = ['newest', 'oldest', 'largest', 'smallest', 'name'];

export type TKindFilter = MediaKind | 'all';

/** Фильтры медиатеки — в адресе: ссылку «все видео с меткой “кейсы”» можно переслать. */
export const useLibraryFilters = () => {
  const [params, setParams] = useSearchParams();
  const rawKind = params.get('kind');
  const rawSort = params.get('sort');

  const kind: TKindFilter = KINDS.includes(rawKind as MediaKind) ? (rawKind as MediaKind) : 'all';
  const sort: AssetSort = SORTS.includes(rawSort as AssetSort) ? (rawSort as AssetSort) : 'newest';
  const tag = params.get('tag');
  const query = params.get('q') ?? '';
  const mine = params.get('mine') === '1';
  /** Только ролики конвейера. */
  const pipeline = params.get('source') === 'pipeline';

  const update = useCallback((patch: Record<string, string | null>) =>
    setParams((current) => {
      const next = new URLSearchParams(current);
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === '') next.delete(key);
        else next.set(key, value);
      }
      return next;
    }, { replace: true }), [setParams]);

  return {
    kind,
    sort,
    tag,
    query,
    mine,
    pipeline,
    setKind: (value: TKindFilter) => update({ kind: value === 'all' ? null : value }),
    setSort: (value: AssetSort) => update({ sort: value === 'newest' ? null : value }),
    setTag: (value: string | null) => update({ tag: value }),
    setQuery: (value: string) => update({ q: value }),
    setMine: (value: boolean) => update({ mine: value ? '1' : null }),
    setPipeline: (value: boolean) => update({ source: value ? 'pipeline' : null }),
    reset: () => update({ kind: null, sort: null, tag: null, q: null, mine: null, source: null }),
    active: kind !== 'all' || Boolean(tag) || Boolean(query) || mine || pipeline,
  };
};
