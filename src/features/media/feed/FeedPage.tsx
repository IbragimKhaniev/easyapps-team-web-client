import { Newspaper } from 'lucide-react';

import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/layout/PageHeader';

/** Раздел медиа: экран собирается следующим этапом. */
export const FeedPage = () => (
  <div className="animate-fade-up">
    <PageHeader title="Лента" />
    <div className="card-surface mx-4 lg:mx-0">
      <EmptyState icon={Newspaper} title="Лента" description="Раздел появится на следующем этапе." />
    </div>
  </div>
);
