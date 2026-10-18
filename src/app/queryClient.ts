import { QueryClient } from '@tanstack/react-query';

import { apiErrorStatus } from '@/lib/errors';

/** Данные считаются свежими 10 секунд — потом обновятся при следующем обращении. */
const STALE_TIME_MS = 10_000;
const GC_TIME_MS = 5 * 60_000;
const MAX_RETRIES = 1;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME_MS,
      gcTime: GC_TIME_MS,
      // Вернулся в приложение — свежие задачи без перезагрузки.
      refetchOnWindowFocus: true,
      // 4xx не повторяем: ни права, ни валидация от повтора не появятся.
      retry: (failureCount, error) => {
        const status = apiErrorStatus(error);
        if (status && status >= 400 && status < 500) return false;
        return failureCount < MAX_RETRIES;
      },
    },
    mutations: { retry: false },
  },
});
