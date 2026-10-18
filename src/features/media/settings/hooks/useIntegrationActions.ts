import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { toast } from 'sonner';

import {
  useLogoutTelegramMtproto,
  useRunMediaJob,
  useSendTelegramMtprotoCode,
  useSignInTelegramMtproto,
  useTestIntegration,
  useUpdateIntegration,
} from '@/api/generated/media-integrations/media-integrations';
import type { Integration, SocialPlatform, UpdateIntegrationBody } from '@/api/models';
import { apiErrorMessage } from '@/lib/errors';
import { refreshIntegrationViews, refreshStatsViews } from '../../lib/cache';
import { PLATFORM_META } from '../../lib/platforms';

/** Действия «Площадок» с тостами и обновлением экранов. Ошибка — тост и `null`. */
export const useIntegrationActions = () => {
  const queryClient = useQueryClient();
  const update = useUpdateIntegration();
  const test = useTestIntegration();
  const sendCode = useSendTelegramMtprotoCode();
  const signIn = useSignInTelegramMtproto();
  const logout = useLogoutTelegramMtproto();
  const runJob = useRunMediaJob();

  const guard = useCallback(async <T,>(work: () => Promise<T>, fallback: string): Promise<T | null> => {
    try {
      return await work();
    } catch (error) {
      toast.error(apiErrorMessage(error, fallback));
      return null;
    } finally {
      refreshIntegrationViews(queryClient);
    }
  }, [queryClient]);

  const save = useCallback((platform: SocialPlatform, body: UpdateIntegrationBody) =>
    guard(async () => {
      const result = (await update.mutateAsync({ platform, data: body })).data;
      toast.success(`${PLATFORM_META[platform].title}: сохранено`);
      return result;
    }, 'Не удалось сохранить'), [guard, update]);

  const check = useCallback((platform: SocialPlatform) =>
    guard(async (): Promise<Integration> => {
      const result = (await test.mutateAsync({ platform })).data;
      if (result.status === 'connected') toast.success(`${PLATFORM_META[platform].title} отвечает${result.account?.title ? ` — ${result.account.title}` : ''}`);
      else toast.error(result.lastError ?? 'Площадка не ответила');
      refreshStatsViews(queryClient);
      return result;
    }, 'Проверка не удалась'), [guard, queryClient, test]);

  const requestCode = useCallback((phone: string) =>
    guard(async () => (await sendCode.mutateAsync({ data: { phone } })).data, 'Не удалось отправить код'), [guard, sendCode]);

  const confirmCode = useCallback((phone: string, code: string, password?: string) =>
    guard(async () => {
      const result = (await signIn.mutateAsync({ data: { phone, code, password: password || undefined } })).data;
      toast.success(`Вход выполнен${result.mtprotoUser ? ` — ${result.mtprotoUser}` : ''}`);
      return result;
    }, 'Не удалось войти'), [guard, signIn]);

  const signOut = useCallback(() =>
    guard(async () => {
      const result = (await logout.mutateAsync()).data;
      toast.success('Вход в Telegram забыт');
      return result;
    }, 'Не удалось выйти'), [guard, logout]);

  const runNow = useCallback((name: string) =>
    guard(async () => {
      const result = (await runJob.mutateAsync({ name })).data;
      toast.success('Задача запущена — итог появится через несколько секунд');
      return result;
    }, 'Не удалось запустить задачу'), [guard, runJob]);

  return {
    save,
    check,
    requestCode,
    confirmCode,
    signOut,
    runNow,
    saving: update.isPending,
    checking: test.isPending,
    signingIn: sendCode.isPending || signIn.isPending,
  };
};
