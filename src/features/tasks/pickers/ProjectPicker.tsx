import { useMemo, type ReactNode } from 'react';

import { AdaptivePicker } from '@/components/common/AdaptivePicker';
import { useProjects } from '@/hooks/useDirectory';
import { ProjectBadge } from '../components/ProjectBadge';

interface IProjectPickerProps {
  value: string | undefined;
  onChange: (projectId: string) => void;
  trigger: ReactNode;
}

export const ProjectPicker = ({ value, onChange, trigger }: IProjectPickerProps) => {
  const { list } = useProjects();
  const options = useMemo(
    () =>
      list.map((project) => ({
        value: project.id,
        label: project.name,
        hint: project.key,
        keywords: [project.key],
        icon: <ProjectBadge project={project} />,
      })),
    [list],
  );

  return (
    <AdaptivePicker title="Проект" options={options} selected={value} searchable={list.length > 6} onSelect={onChange} trigger={trigger} />
  );
};
