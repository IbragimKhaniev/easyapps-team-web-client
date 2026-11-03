import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { useListIntegrations } from '@/api/generated/media-integrations/media-integrations';
import type { Integration, VkCallbackBody } from '@/api/models';
import { PageHeader } from '@/components/layout/PageHeader';
import { HiggsfieldCard } from './components/HiggsfieldCard';
import { IntegrationCard } from './components/IntegrationCard';
import { JobsCard } from './components/JobsCard';
import { StorageCard } from './components/StorageCard';
import { useIntegrationActions } from './hooks/useIntegrationActions';
import { claimVkReturn, vkReturnFromLocation } from './lib/vkReturn';

const VK_RETURN_KEYS = ['payload', 'code', 'device_id', 'state', 'type', 'error', 'error_description'];

/** После входа в Higgsfield сервер возвращает сюда: `?higgsfield=connected` или `error&message=`. */
const useHiggsfieldReturn = () => {
  const [params, setParams] = useSearchParams();
  const result = params.get('higgsfield');
  const message = params.get('message');
  useEffect(() => {
    if (!result) return;
    if (result === 'connected') toast.success('Общий аккаунт Higgsfield подключён — агенты команды уже видят его инструменты');
    else toast.error(message || 'Higgsfield не подключился');
    setParams((current) => {
      const next = new URLSearchParams(current);
      next.delete('higgsfield');
      next.delete('message');
      return next;
    }, { replace: true });
  }, [result, message, setParams]);
};

/** VK возвращает на эту же страницу: код уходит на сервер, из адреса сразу убирается. */
const useVkReturn = (finish: (body: VkCallbackBody) => Promise<Integration | null>) => {
  const [params, setParams] = useSearchParams();
  const finishRef = useRef(finish);
  finishRef.current = finish;
  const search = params.toString();

  useEffect(() => {
    const parsed = vkReturnFromLocation(search ? `?${search}` : '', window.location.hash);
    if (!parsed) return;
    const strip = () => {
      setParams((current) => {
        const next = new URLSearchParams(current);
        for (const key of VK_RETURN_KEYS) next.delete(key);
        return next;
      }, { replace: true });
      if (window.location.hash) {
        window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}`);
      }
    };
    if (parsed.error || !parsed.code || !parsed.deviceId || !parsed.state) {
      toast.error(parsed.error || 'VK вернул неполный ответ — нажмите «Войти через VK» ещё раз');
      strip();
      return;
    }
    if (!claimVkReturn(parsed.state)) {
      strip();
      return;
    }
    const body = { code: parsed.code, deviceId: parsed.deviceId, state: parsed.state };
    void finishRef.current(body).then((result) => {
      if (!result) return;
      if (result.enabled && result.status === 'connected') {
        toast.success(`VK подключён${result.account?.title ? ` — ${result.account.title}` : ''}`);
      } else if (result.lastError) toast.error(result.lastError);
      else if (result.lastWarning) toast.error(result.lastWarning);
      else toast.success('Ключ VK сохранён');
    }).finally(strip);
  }, [search, setParams]);
};

/**
 * «Площадки» — подключение Telegram, Instagram и VK (ключи хранятся
 * зашифрованными), общий аккаунт Higgsfield, хранилище медиатеки и фоновые
 * задачи. Доступно и admin, и manager.
 */
export const MediaSettingsPage = () => {
  const { data, isLoading } = useListIntegrations();
  const actions = useIntegrationActions();
  const integrations = data?.data ?? [];
  useHiggsfieldReturn();
  useVkReturn(actions.finishVk);

  return (
    <div className="animate-fade-up">
      <PageHeader title="Площадки" subtitle="Ключи площадок шифруются на сервере; в интерфейсе видно только, что ключ задан." />
      <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-12 lg:gap-5 lg:px-0">
        <div className="flex flex-col gap-4 lg:col-span-8 lg:gap-5">
          {isLoading
            ? Array.from({ length: 3 }, (_, index) => <div key={index} className="skeleton h-72 rounded-card" />)
            : integrations.map((integration) => <IntegrationCard key={integration.platform} integration={integration} actions={actions} />)}
        </div>
        <div className="flex flex-col gap-4 lg:col-span-4 lg:gap-5">
          <HiggsfieldCard />
          <StorageCard />
          <JobsCard actions={actions} />
        </div>
      </div>
    </div>
  );
};
