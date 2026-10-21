import { Check, CircleAlert, Loader2, Plug, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { useApproveOAuthRequest, useDenyOAuthRequest, useGetOAuthRequest } from '@/api/generated/oauth/oauth';
import { OAuthRequestStatus, type TeamMember } from '@/api/models';
import { OAUTH_ERROR_PARAM, OAUTH_REQUEST_PARAM, PATHS } from '@/app/paths';
import { Logo } from '@/components/common/Logo';
import { Button } from '@/components/ui/button';
import { useLogoutAction } from '@/features/auth/useLogoutAction';
import { useSession } from '@/hooks/useSession';
import { apiErrorMessage } from '@/lib/errors';

/** Почему вход не дошёл до согласия — `?error=` от сервера входа. */
const CONSENT_ERRORS: Readonly<Record<string, string>> = {
  client: 'Это приложение не зарегистрировано в easyapps team или регистрация устарела. Удалите коннектор easyapps team в Claude и добавьте его заново.',
  redirect: 'Адрес возврата не совпадает с регистрацией приложения — подключение остановлено. Удалите коннектор в Claude и добавьте его заново.',
  server: 'Сервер не смог начать подключение. Вернитесь в Claude и нажмите «Connect» ещё раз.',
};
const EXPIRED_TEXT = 'Ссылка на подключение устарела или уже сработала. Вернитесь в Claude и нажмите «Connect» ещё раз.';

/** Рамка — как у входа: логотип и карточка по центру; окно входа из Claude обычно узкое. */
const ConsentFrame = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-[100dvh] items-center justify-center px-4 py-10">
    <div className="w-full max-w-[460px]">
      <div className="mb-8 flex justify-center">
        <Logo />
      </div>
      <div className="card-surface flex flex-col gap-5 p-7 shadow-frame">{children}</div>
      <p className="mt-6 text-center text-[13px] text-ink-faint">team.easyapps.click · вход приложений в easyapps team</p>
    </div>
  </div>
);

const Notice = ({ title, text, busy = false }: { title: string; text: string; busy?: boolean }) => (
  <ConsentFrame>
    <div>
      <h1 className="flex items-center gap-2.5 text-[24px] font-extrabold leading-tight tracking-tight text-ink">
        {busy && <Loader2 className="h-6 w-6 shrink-0 animate-spin text-brand-700" />}
        {title}
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{text}</p>
    </div>
  </ConsentFrame>
);

const Loading = () => (
  <ConsentFrame>
    <div className="skeleton h-44 rounded-2xl" />
  </ConsentFrame>
);

type TDecision = 'approved' | 'denied';

/** Запрос найден, человек вошёл: кто просит доступ, куда вернётся код — и решение. */
const ConsentRequest = ({ id, user }: { id: string; user: TeamMember }) => {
  const { data, isLoading } = useGetOAuthRequest(id, { query: { retry: false } });
  const approve = useApproveOAuthRequest();
  const deny = useDenyOAuthRequest();
  const [decision, setDecision] = useState<TDecision | null>(null);
  const switchAccount = useLogoutAction(`${PATHS.oauthConsent}?${OAUTH_REQUEST_PARAM}=${encodeURIComponent(id)}`);
  const busy = approve.isPending || deny.isPending || Boolean(decision);

  const decide = async (next: TDecision) => {
    try {
      const result = next === 'approved' ? await approve.mutateAsync({ id }) : await deny.mutateAsync({ id });
      setDecision(next);
      // Адрес возврата приложения (claude.ai или loopback этого компьютера) — с кодом или отказом.
      window.location.assign(result.data.redirectUrl);
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Не удалось сохранить решение'));
    }
  };

  if (isLoading) return <Loading />;
  if (decision) {
    return <Notice busy title={decision === 'approved' ? 'Доступ разрешён' : 'В доступе отказано'} text="Возвращаем вас в приложение…" />;
  }
  const request = data?.data;
  if (!request || request.status === OAuthRequestStatus.expired) return <Notice title="Ссылка устарела" text={EXPIRED_TEXT} />;
  if (request.status === OAuthRequestStatus.approved) {
    return <Notice title="Подключение уже подтверждено" text="Эту вкладку можно закрыть и вернуться в приложение." />;
  }
  if (request.status === OAuthRequestStatus.denied) {
    return <Notice title="В доступе отказано" text="Чтобы подключить снова, вернитесь в Claude и нажмите «Connect»." />;
  }

  return (
    <ConsentFrame>
      <div>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-800">
          <Plug className="h-5 w-5" />
        </span>
        <h1 className="mt-4 text-[24px] font-extrabold leading-tight tracking-tight text-ink">
          {request.clientName} просит доступ к easyapps team
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
          Агент сможет работать от вашего имени: задачи и комментарии, контент-план и медиатека, журнал работы и база знаний — всё, что
          вы можете на этом сайте.
        </p>
      </div>

      <ul className="flex flex-col gap-1.5 rounded-2xl bg-secondary p-4 text-[14px] leading-snug text-ink-soft">
        <li>
          Вы вошли как <b className="text-ink">{user.name}</b> · {user.email}
        </li>
        <li>
          После решения вернётесь на <b className="text-ink">{request.redirectHost}</b>
        </li>
      </ul>

      {request.loopback && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-[13.5px] leading-snug text-amber-900">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <span>
            Код уйдёт программе на этом компьютере ({request.redirectHost}). Разрешайте, только если подключение начали сами — в Claude
            Code или другом агенте здесь.
          </span>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <Button size="lg" className="sm:flex-1" disabled={busy} onClick={() => void decide('approved')}>
          {approve.isPending ? <Loader2 className="animate-spin" /> : <Check />} Разрешить
        </Button>
        <Button size="lg" variant="soft" className="sm:flex-1" disabled={busy} onClick={() => void decide('denied')}>
          {deny.isPending ? <Loader2 className="animate-spin" /> : <X />} Отказать
        </Button>
      </div>

      <p className="text-[12.5px] leading-snug text-ink-faint">
        Отозвать доступ можно в любой момент: «Агенты и плагин» → «Мои ключи» или в настройках коннекторов Claude.{' '}
        <button type="button" className="font-semibold text-brand-800 hover:underline" onClick={() => void switchAccount()}>
          Войти другим аккаунтом
        </button>
      </p>
    </ConsentFrame>
  );
};

/**
 * Согласие на вход приложения в easyapps team по OAuth: сюда ведёт
 * `/oauth/authorize` team-api — коннектор easyapps team в Claude (claude.ai,
 * Desktop, Design, Cowork) или агент на этом компьютере. Без входа на сайт —
 * сначала вход и обратно сюда. «Разрешить» отправляет браузер в адрес возврата
 * приложения с одноразовым кодом, «Отказать» — с `access_denied`.
 */
export const ConnectorConsentPage = () => {
  const { user, isLoading } = useSession();
  const location = useLocation();
  const [params] = useSearchParams();
  const error = params.get(OAUTH_ERROR_PARAM);
  const requestId = params.get(OAUTH_REQUEST_PARAM);

  if (error || !requestId) return <Notice title="Подключение не удалось" text={(error && CONSENT_ERRORS[error]) || EXPIRED_TEXT} />;
  if (isLoading) return <Loading />;
  if (!user) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`${PATHS.login}?redirect=${redirect}`} replace />;
  }
  return <ConsentRequest id={requestId} user={user} />;
};
