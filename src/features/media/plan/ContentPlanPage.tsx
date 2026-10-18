import { CalendarDays } from 'lucide-react';

import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/layout/PageHeader';

/** Раздел медиа: экран собирается следующим этапом. */
export const ContentPlanPage = () => (
  <div className="animate-fade-up">
    <PageHeader title="Контент-план" />
    <div className="card-surface mx-4 lg:mx-0">
      <EmptyState icon={CalendarDays} title="Контент-план" description="Раздел появится на следующем этапе." />
    </div>
  </div>
);
