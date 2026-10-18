import { Images } from 'lucide-react';

import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/layout/PageHeader';

/** Раздел медиа: экран собирается следующим этапом. */
export const MediaLibraryPage = () => (
  <div className="animate-fade-up">
    <PageHeader title="Медиатека" />
    <div className="card-surface mx-4 lg:mx-0">
      <EmptyState icon={Images} title="Медиатека" description="Раздел появится на следующем этапе." />
    </div>
  </div>
);
