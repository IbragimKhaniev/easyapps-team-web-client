import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { toast } from 'sonner';

import { useClearTaskActivity } from '@/api/generated/activity/activity';
import { usePurgeTask } from '@/api/generated/tasks/tasks';
import { refreshJournalViews } from '@/features/agents/lib/journalCache';
import { apiErrorMessage } from '@/lib/errors';
import { HISTORY_FORMS, pluralize } from '@/lib/plural';
import { refreshTaskViews } from '../lib/cache';
import { purgeSummary } from '../lib/archiveText';

/**
 * Действия администратора с задачами: удалить из архива насовсем и очистить
 * историю. Сервер пускает только администратора — у менеджера этих кнопок нет.
 * Вернули `false` — не вышло, ошибка уже в тосте.
 */
export const useTaskAdminActions = () => {
  const queryClient = useQueryClient();
  const purge = usePurgeTask();
  const clear = useClearTaskActivity();

  const purgeTask = useCallback(
    async (key: string, withWork: boolean): Promise<boolean> => {
      try {
        const { data } = await purge.mutateAsync({ key, params: { withWork: withWork ? 'true' : 'false' } });
        toast.success(purgeSummary(data));
        return true;
      } catch (error) {
        toast.error(apiErrorMessage(error, 'Не удалось удалить задачу'));
        return false;
      } finally {
        // Карточку удалённой задачи не перечитываем: она закрывается, а перечитанная мелькнула бы «не найдена».
        refreshTaskViews(queryClient);
        refreshJournalViews(queryClient);
      }
    },
    [queryClient, purge],
  );

  const clearHistory = useCallback(
    async (key: string): Promise<boolean> => {
      try {
        const { data } = await clear.mutateAsync({ key });
        toast.success(data.history ? `История очищена: ${pluralize(data.history, HISTORY_FORMS)}` : 'История уже пуста');
        return true;
      } catch (error) {
        toast.error(apiErrorMessage(error, 'Не удалось очистить историю'));
        return false;
      } finally {
        refreshTaskViews(queryClient, key);
      }
    },
    [queryClient, clear],
  );

  return { purgeTask, clearHistory };
};
