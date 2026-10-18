import { BarChart3 } from 'lucide-react';

import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/layout/PageHeader';

/** Раздел медиа: экран собирается следующим этапом. */
export const AnalyticsPage = () => (
  <div className="animate-fade-up">
    <PageHeader title="Аналитика" />
    <div className="card-surface mx-4 lg:mx-0">
      <EmptyState icon={BarChart3} title="Аналитика" description="Раздел появится на следующем этапе." />
    </div>
  </div>
);
