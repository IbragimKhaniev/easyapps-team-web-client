import type { QueryClient } from '@tanstack/react-query';

import { getGetAgentsTeamStatusQueryKey } from '@/api/generated/agents/agents';
import { getGetJournalReviewQueryKey, getListJournalSessionsQueryKey } from '@/api/generated/journal/journal';

/**
 * Журнал в кэше react-query: после удаления работ перечитать ленты (журнал,
 * вкладка «Агенты» задачи и её счётчик — это тот же список с `task`), разбор и
 * «Команду» (работы за 7 дней). Карточку удалённой работы не трогаем: она
 * закрывается, а перечитанная мелькнула бы «не найдена».
 */
export const refreshJournalViews = (queryClient: QueryClient): void => {
  void queryClient.invalidateQueries({ queryKey: getListJournalSessionsQueryKey() });
  void queryClient.invalidateQueries({ queryKey: getGetJournalReviewQueryKey() });
  void queryClient.invalidateQueries({ queryKey: getGetAgentsTeamStatusQueryKey() });
};
