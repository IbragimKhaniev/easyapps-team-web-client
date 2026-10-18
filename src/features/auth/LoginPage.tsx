import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Lock } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';

import { getGetMeQueryKey, useLogin } from '@/api/generated/auth/auth';
import { PATHS } from '@/app/paths';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSession } from '@/hooks/useSession';
import { apiErrorMessage } from '@/lib/errors';

/** Куда вернуться после входа: только свои пути, без открытых редиректов. */
const safeRedirect = (raw: string | null): string => (raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : PATHS.overview);

/**
 * Вход команды: email и пароль от аккаунта easyapps. Пускает только
 * администраторов и менеджеров; связка ключей iOS подставляет пароль сама
 * (`autocomplete`).
 */
export const LoginPage = () => {
  const { user, isLoading } = useSession();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const redirect = safeRedirect(params.get('redirect'));

  if (!isLoading && user) return <Navigate to={redirect} replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      const result = await login.mutateAsync({ data: { email: email.trim(), password } });
      queryClient.setQueryData(getGetMeQueryKey(), result);
      navigate(redirect, { replace: true });
    } catch (loginError) {
      setError(apiErrorMessage(loginError, 'Не удалось войти'));
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <form onSubmit={(event) => void submit(event)} className="card-surface flex flex-col gap-5 p-7 shadow-frame">
          <div>
            <h1 className="text-[28px] font-extrabold tracking-tight text-ink">Вход для команды</h1>
            <p className="mt-1.5 text-[15px] text-ink-muted">Email и пароль от аккаунта easyapps. Доступ — у администраторов и менеджеров.</p>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-bold text-ink-soft">Email</span>
            <Input
              type="email"
              autoComplete="username"
              inputMode="email"
              autoCapitalize="none"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@easyapps.click"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-bold text-ink-soft">Пароль</span>
            <Input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error && (
            <div className="flex items-start gap-2 rounded-2xl bg-rose-50 px-3.5 py-3 text-[14px] font-medium text-rose-700">
              <Lock className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <Button type="submit" size="lg" disabled={login.isPending} className="w-full">
            {login.isPending ? 'Входим…' : 'Войти'}
            <ArrowRight />
          </Button>
        </form>

        <p className="mt-6 text-center text-[13px] text-ink-faint">team.easyapps.click · рабочее место команды</p>
      </div>
    </div>
  );
};
