import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { useListIntegrations } from '@/api/generated/media-integrations/media-integrations';
import { PageHeader } from '@/components/layout/PageHeader';
import { HiggsfieldCard } from './components/HiggsfieldCard';
import { IntegrationCard } from './components/IntegrationCard';
import { JobsCard } from './components/JobsCard';
import { StorageCard } from './components/StorageCard';
import { useIntegrationActions } from './hooks/useIntegrationActions';

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
