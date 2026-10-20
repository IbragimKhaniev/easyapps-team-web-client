import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { toast } from 'sonner';

import {
  getGetKnowledgeEntryQueryKey,
  getListKnowledgeEntriesQueryKey,
  getListKnowledgeSectionsQueryKey,
  getListKnowledgeTagsQueryKey,
  useArchiveKnowledgeEntry,
  useCreateKnowledgeEntry,
  useCreateKnowledgeSection,
  useRestoreKnowledgeEntry,
  useUpdateKnowledgeEntry,
  useUpdateKnowledgeSection,
} from '@/api/generated/knowledge/knowledge';
import type {
  CreateKnowledgeEntryInput,
  CreateKnowledgeSectionInput,
  KnowledgeEntry,
  UpdateKnowledgeEntryInput,
  UpdateKnowledgeSectionInput,
} from '@/api/models';
import { apiErrorMessage } from '@/lib/errors';

/**
 * Правки базы знаний с сайта: после каждой — перечитать списки, разделы
 * (счётчики) и метки. Ошибка — тостом с текстом сервера, результат — null.
 */
export const useKnowledgeActions = () => {
  const queryClient = useQueryClient();
  const create = useCreateKnowledgeEntry();
  const update = useUpdateKnowledgeEntry();
  const archive = useArchiveKnowledgeEntry();
  const restore = useRestoreKnowledgeEntry();
  const createSection = useCreateKnowledgeSection();
  const updateSection = useUpdateKnowledgeSection();

  const refresh = useCallback(async (entryId?: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getListKnowledgeEntriesQueryKey() }),
      queryClient.invalidateQueries({ queryKey: getListKnowledgeSectionsQueryKey() }),
      queryClient.invalidateQueries({ queryKey: getListKnowledgeTagsQueryKey() }),
      ...(entryId ? [queryClient.invalidateQueries({ queryKey: getGetKnowledgeEntryQueryKey(entryId) })] : []),
    ]);
  }, [queryClient]);

  const guard = useCallback(async <T>(action: () => Promise<T>, failure: string, success?: string): Promise<T | null> => {
    try {
      const result = await action();
      if (success) toast.success(success);
      return result;
    } catch (error) {
      toast.error(apiErrorMessage(error, failure));
      return null;
    }
  }, []);

  return {
    saving: create.isPending || update.isPending || archive.isPending || restore.isPending || createSection.isPending || updateSection.isPending,
    createEntry: (data: CreateKnowledgeEntryInput): Promise<KnowledgeEntry | null> => guard(async () => {
      const entry = (await create.mutateAsync({ data })).data;
      await refresh();
      return entry;
    }, 'Не удалось сохранить запись', 'Запись в базе знаний'),
    updateEntry: (id: string, data: UpdateKnowledgeEntryInput): Promise<KnowledgeEntry | null> => guard(async () => {
      const entry = (await update.mutateAsync({ id, data })).data;
      await refresh(id);
      return entry;
    }, 'Не удалось сохранить запись'),
    archiveEntry: (id: string): Promise<true | null> => guard(async () => {
      await archive.mutateAsync({ id, data: {} });
      await refresh(id);
      return true as const;
    }, 'Не удалось убрать в архив', 'Запись в архиве'),
    restoreEntry: (id: string): Promise<KnowledgeEntry | null> => guard(async () => {
      const entry = (await restore.mutateAsync({ id })).data;
      await refresh(id);
      return entry;
    }, 'Не удалось вернуть запись', 'Запись снова в базе'),
    createSection: (data: CreateKnowledgeSectionInput) => guard(async () => {
      const section = (await createSection.mutateAsync({ data })).data;
      await refresh();
      return section;
    }, 'Не удалось добавить раздел', 'Раздел добавлен'),
    updateSection: (id: string, data: UpdateKnowledgeSectionInput) => guard(async () => {
      const section = (await updateSection.mutateAsync({ id, data })).data;
      await refresh();
      return section;
    }, 'Не удалось сохранить раздел'),
  };
};
