import { Clapperboard } from 'lucide-react';
import { Navigate } from 'react-router-dom';

import { useListPipelineProjects } from '@/api/generated/pipeline/pipeline';
import { pipelineHref } from '@/app/paths';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/layout/PageHeader';
import { MediaSectionTabs } from '../media/components/MediaSectionTabs';

/** /pipeline: конвейер один — сразу в него; нет ни одного — как завести. */
export const PipelineIndexPage = () => {
  const { data, isLoading } = useListPipelineProjects();
  const projects = data?.data ?? [];

  if (isLoading) return <div className="skeleton m-4 h-48 rounded-card lg:m-0" />;
  if (projects.length) return <Navigate to={pipelineHref(projects[0]!.key)} replace />;

  return (
    <div className="animate-fade-up">
      <PageHeader title="Конвейер роликов" subtitle="Каст, библиотека клипов, ролики и их проверка">
        <MediaSectionTabs />
      </PageHeader>
      <EmptyState
        icon={Clapperboard}
        title="Конвейеров пока нет"
        description="Перенесите папку конвейера: попросите агента с плагином easyapps-team — «перенеси папку конвейера роликов в team easyapps» (утилита pipeline.mjs import). Дальше данные и клипы живут здесь, а агенты работают с ними через MCP."
      />
    </div>
  );
};
