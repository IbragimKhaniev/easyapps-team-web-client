import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { toast } from 'sonner';

import { useDeleteJournalSession, usePurgeJournalSessions } from '@/api/generated/journal/journal';
import type { PurgeJournalSessionsBody } from '@/api/models';
import { refreshTaskViews } from '@/features/tasks/lib/cache';
import { apiErrorMessage } from '@/lib/errors';
import { ENTRY_FORMS, pluralize, WORK_FORMS } from '@/lib/plural';
import { refreshJournalViews } from '../lib/journalCache';

/**
 * Действия администратора с журналом: удалить работу со всем ходом и очистить
 * журнал по фильтру ленты. Сервер пускает только администратора. Вернули
 * `false` — не вышло, ошибка уже в тосте.
 */
export const useJournalAdminActions = () => {
  const queryClient = useQueryClient();
  const remove = useDeleteJournalSession();
  const purge = usePurgeJournalSessions();

  /** Журнал и всё, что на него ссылается: история задач теряет ссылки на удалённые работы. */
  const refreshAll = useCallback(() => {
    refreshJournalViews(queryClient);
    refreshTaskViews(queryClient);
  }, [queryClient]);

  const deleteWork = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const { data } = await remove.mutateAsync({ id });
        toast.success(data.entries ? `Работа удалена — и ${pluralize(data.entries, ENTRY_FORMS)} хода` : 'Работа удалена');
        return true;
      } catch (error) {
        toast.error(apiErrorMessage(error, 'Не удалось удалить работу'));
        return false;
      } finally {
        refreshAll();
      }
    },
    [remove, refreshAll],
  );

  const purgeWorks = useCallback(
    async (body: PurgeJournalSessionsBody): Promise<boolean> => {
      try {
        const { data } = await purge.mutateAsync({ data: body });
        toast.success(data.sessions
          ? `Журнал очищен: ${pluralize(data.sessions, WORK_FORMS)}, ${pluralize(data.entries, ENTRY_FORMS)} хода`
          : 'Под фильтром нечего удалять');
        return true;
      } catch (error) {
        toast.error(apiErrorMessage(error, 'Не удалось очистить журнал'));
        return false;
      } finally {
        refreshAll();
      }
    },
    [purge, refreshAll],
  );

  return { deleteWork, purgeWorks };
};
