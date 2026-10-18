import { useListIntegrations } from '@/api/generated/media-integrations/media-integrations';
import { PageHeader } from '@/components/layout/PageHeader';
import { IntegrationCard } from './components/IntegrationCard';
import { JobsCard } from './components/JobsCard';
import { StorageCard } from './components/StorageCard';
import { useIntegrationActions } from './hooks/useIntegrationActions';

/**
 * «Площадки» — подключение Telegram, Instagram и VK (ключи хранятся
 * зашифрованными), хранилище медиатеки и фоновые задачи. Доступно и admin,
 * и manager.
 */
export const MediaSettingsPage = () => {
  const { data, isLoading } = useListIntegrations();
  const actions = useIntegrationActions();
  const integrations = data?.data ?? [];

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
          <StorageCard />
          <JobsCard actions={actions} />
        </div>
      </div>
    </div>
  );
};
