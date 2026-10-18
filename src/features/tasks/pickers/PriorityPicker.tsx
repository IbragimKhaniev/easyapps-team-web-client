import type { ReactNode } from 'react';

import type { TaskPriority } from '@/api/models';
import { AdaptivePicker } from '@/components/common/AdaptivePicker';
import { PRIORITY_META, PRIORITY_ORDER } from '@/lib/tracker';
import { PriorityIcon } from '../components/PriorityIcon';

interface IPriorityPickerProps {
  value: TaskPriority;
  onChange: (priority: TaskPriority) => void;
  trigger: ReactNode;
}

const OPTIONS = PRIORITY_ORDER.map((priority) => ({
  value: priority,
  label: PRIORITY_META[priority].label,
  icon: <PriorityIcon priority={priority} />,
}));

export const PriorityPicker = ({ value, onChange, trigger }: IPriorityPickerProps) => (
  <AdaptivePicker title="Приоритет" options={OPTIONS} selected={value} onSelect={onChange} trigger={trigger} />
);
