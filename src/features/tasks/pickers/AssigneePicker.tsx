import { UserX } from 'lucide-react';
import { useMemo, type ReactNode } from 'react';

import { AdaptivePicker, type IPickerOption } from '@/components/common/AdaptivePicker';
import { MemberAvatar } from '@/components/common/MemberAvatar';
import { useMembers } from '@/hooks/useDirectory';
import { useSession } from '@/hooks/useSession';

/** Пустое значение в списке выбора: «без исполнителя». */
export const NO_ASSIGNEE = 'none';

interface IAssigneePickerProps {
  value: string | null;
  onChange: (assigneeId: string | null) => void;
  trigger: ReactNode;
}

/** Исполнитель: сначала «я», потом команда, внизу — «без исполнителя». */
export const AssigneePicker = ({ value, onChange, trigger }: IAssigneePickerProps) => {
  const { list } = useMembers();
  const { user } = useSession();

  const options = useMemo<IPickerOption<string>[]>(() => {
    const sorted = [...list].sort((a, b) => (a.id === user?.id ? -1 : b.id === user?.id ? 1 : 0));
    return [
      ...sorted.map((member) => ({
        value: member.id,
        label: member.id === user?.id ? `${member.name} (я)` : member.name,
        keywords: [member.email],
        icon: <MemberAvatar member={member} size="xs" />,
      })),
      { value: NO_ASSIGNEE, label: 'Без исполнителя', icon: <UserX className="h-5 w-5 text-ink-faint" /> },
    ];
  }, [list, user?.id]);

  return (
    <AdaptivePicker
      title="Исполнитель"
      options={options}
      selected={value ?? NO_ASSIGNEE}
      searchable
      onSelect={(selected) => onChange(selected === NO_ASSIGNEE ? null : selected)}
      trigger={trigger}
    />
  );
};
