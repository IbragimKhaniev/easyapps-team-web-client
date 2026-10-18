import { useGetMe } from '@/api/generated/auth/auth';
import type { TeamMember } from '@/api/models';

export interface ISessionState {
  user: TeamMember | null;
  isAdmin: boolean;
  isLoading: boolean;
}

/** Кто вошёл. Сессию держит cookie; здесь — кэш `GET /auth/me`. */
export const useSession = (): ISessionState => {
  const { data, isLoading } = useGetMe({ query: { staleTime: 5 * 60_000, retry: false } });
  const user = data?.data.user ?? null;
  return { user, isAdmin: user?.role === 'admin', isLoading };
};
