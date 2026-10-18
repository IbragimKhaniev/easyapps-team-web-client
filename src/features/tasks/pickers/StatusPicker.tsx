import type { ReactNode } from 'react';

import type { TaskStatus } from '@/api/models';
import { AdaptivePicker } from '@/components/common/AdaptivePicker';
import { STATUS_META, STATUS_ORDER } from '@/lib/tracker';
import { StatusIcon } from '../components/StatusIcon';

interface IStatusPickerProps {
  value: TaskStatus;
  onChange: (status: TaskStatus) => void;
  trigger: ReactNode;
}

const OPTIONS = STATUS_ORDER.map((status) => ({
  value: status,
  label: STATUS_META[status].label,
  icon: <StatusIcon status={status} />,
}));

export const StatusPicker = ({ value, onChange, trigger }: IStatusPickerProps) => (
  <AdaptivePicker title="Статус" options={OPTIONS} selected={value} onSelect={onChange} trigger={trigger} />
);
