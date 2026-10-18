import { SlidersHorizontal } from 'lucide-react';

import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/layout/PageHeader';

/** Раздел медиа: экран собирается следующим этапом. */
export const MediaSettingsPage = () => (
  <div className="animate-fade-up">
    <PageHeader title="Площадки" />
    <div className="card-surface mx-4 lg:mx-0">
      <EmptyState icon={SlidersHorizontal} title="Площадки" description="Раздел появится на следующем этапе." />
    </div>
  </div>
);
