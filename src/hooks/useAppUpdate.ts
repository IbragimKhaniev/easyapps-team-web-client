import { useSyncExternalStore } from 'react';

import { getAppUpdate, subscribeAppUpdate, type IAppUpdateRequest } from '@/lib/appUpdate';

/**
 * Нужен ли вместо приложения экран «Платформа обновилась»: не загрузился чанк
 * после выката (решает `lib/appUpdate.ts`). null — всё работает как обычно.
 */
export const useAppUpdate = (): IAppUpdateRequest | null => useSyncExternalStore(subscribeAppUpdate, getAppUpdate);
