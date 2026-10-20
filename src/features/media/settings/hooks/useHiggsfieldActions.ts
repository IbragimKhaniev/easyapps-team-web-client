import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { toast } from 'sonner';

import {
  getGetHiggsfieldStateQueryKey,
  useConnectHiggsfield,
  useDisconnectHiggsfield,
  useRefreshHiggsfield,
  useUpdateHiggsfieldPolicy,
} from '@/api/generated/higgsfield/higgsfield';
import type { HiggsfieldPolicy } from '@/api/models';
import { apiErrorMessage } from '@/lib/errors';

/**
 * Общий аккаунт Higgsfield: вход (уводит в Higgsfield и возвращает в
 * «Площадки»), отключение, доступ команды. Всё — у админа.
 */
export const useHiggsfieldActions = () => {
  const queryClient = useQueryClient();
  const connect = useConnectHiggsfield();
  const disconnect = useDisconnectHiggsfield();
  const refresh = useRefreshHiggsfield();
  const policy = useUpdateHiggsfieldPolicy();

  const reload = useCallback(() => queryClient.invalidateQueries({ queryKey: getGetHiggsfieldStateQueryKey() }), [queryClient]);

  const guard = useCallback(async (action: () => Promise<unknown>, failure: string, success?: string) => {
    try {
      await action();
      await reload();
      if (success) toast.success(success);
      return true;
    } catch (error) {
      toast.error(apiErrorMessage(error, failure));
      return false;
    }
  }, [reload]);

  return {
    busy: connect.isPending || disconnect.isPending || refresh.isPending || policy.isPending,
    /** В Higgsfield — войти в общий аккаунт; вернёт сюда с ?higgsfield=connected. */
    connect: async () => {
      try {
        const response = await connect.mutateAsync();
        window.location.assign(response.data.authorizationUrl);
      } catch (error) {
        toast.error(apiErrorMessage(error, 'Higgsfield не начал вход'));
      }
    },
    disconnect: () => guard(() => disconnect.mutateAsync(), 'Не удалось отключить', 'Общий аккаунт Higgsfield отключён'),
    refresh: () => guard(() => refresh.mutateAsync(), 'Не удалось обновить', 'Каталог и баланс обновлены'),
    setPolicy: (patch: Partial<HiggsfieldPolicy>, success?: string) =>
      guard(() => policy.mutateAsync({ data: patch }), 'Доступ не сохранился', success),
  };
};
