import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import { KnowledgeKind } from '@/api/models';
import { KNOWLEDGE_ENTRY_PARAM } from '@/app/paths';

/** Особые «разделы» навигации базы: все записи и закреплённые. */
export const ALL_SECTIONS = 'all';
export const PINNED_SECTION = 'pinned';

const isKind = (value: string | null): value is KnowledgeKind =>
  Boolean(value) && (Object.values(KnowledgeKind) as string[]).includes(value!);

/**
 * Состояние базы знаний — в адресе: раздел, вид, поиск, метка и открытая
 * запись (`?entry=`). Ссылку на запись или подборку можно переслать.
 */
export const useKnowledgeParams = () => {
  const [params, setParams] = useSearchParams();
  const section = params.get('section') ?? ALL_SECTIONS;
  const kindParam = params.get('kind');
  const kind = isKind(kindParam) ? kindParam : null;
  const q = params.get('q') ?? '';
  const tag = params.get('tag');
  const entryId = params.get(KNOWLEDGE_ENTRY_PARAM);

  const update = useCallback((patch: Record<string, string | null>, replace = true) => setParams((current) => {
    const next = new URLSearchParams(current);
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    return next;
  }, { replace }), [setParams]);

  const openEntry = useCallback((id: string) => update({ [KNOWLEDGE_ENTRY_PARAM]: id }, false), [update]);
  const closeEntry = useCallback(() => update({ [KNOWLEDGE_ENTRY_PARAM]: null }), [update]);

  return { section, kind, q, tag, entryId, update, openEntry, closeEntry };
};
