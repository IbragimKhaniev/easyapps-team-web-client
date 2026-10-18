import { useMemo } from 'react';

import { useListIntegrations } from '@/api/generated/media-integrations/media-integrations';
import type { Integration, SocialPlatform } from '@/api/models';
import { PLATFORM_META } from '../lib/platforms';

/** Площадки меняются редко — держим минуту, конструктору и календарю хватает. */
const INTEGRATIONS_STALE_MS = 60_000;

export interface IPlatformAccount {
  title: string;
  handle: string;
}

/**
 * Что подключено в «Площадках» и как называются аккаунты — для конструктора
 * (какие площадки включить новому посту, имена в предпросмотре) и календаря.
 */
export const useIntegrationsState = () => {
  const { data, isLoading } = useListIntegrations({ query: { staleTime: INTEGRATIONS_STALE_MS } });
  const integrations = data?.data;

  return useMemo(() => {
    const list: Integration[] = integrations ?? [];
    const connected = new Set<SocialPlatform>(list.filter((item) => item.enabled).map((item) => item.platform));
    const accountOf = (platform: SocialPlatform): IPlatformAccount => {
      const account = list.find((item) => item.platform === platform)?.account;
      return {
        title: account?.title ?? `easyapps · ${PLATFORM_META[platform].title}`,
        handle: account?.handle ?? 'easyapps',
      };
    };
    return { integrations: list, connected, accountOf, isLoading };
  }, [integrations, isLoading]);
};
