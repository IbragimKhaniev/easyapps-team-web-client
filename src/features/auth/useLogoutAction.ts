import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useLogout } from '@/api/generated/auth/auth';
import { PATHS } from '@/app/paths';

/** Выход: отзываем сессию на сервере, чистим кэш и уходим на вход. */
export const useLogoutAction = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { mutateAsync } = useLogout();

  return useCallback(async () => {
    try {
      await mutateAsync();
    } finally {
      queryClient.clear();
      navigate(PATHS.login, { replace: true });
    }
  }, [mutateAsync, navigate, queryClient]);
};
