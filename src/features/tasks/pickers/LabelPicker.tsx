import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { toast } from 'sonner';

import { getListLabelsQueryKey, useCreateLabel } from '@/api/generated/labels/labels';
import { AdaptivePicker } from '@/components/common/AdaptivePicker';
import { Input } from '@/components/ui/input';
import { useLabels } from '@/hooks/useDirectory';
import { apiErrorMessage } from '@/lib/errors';
import { TRACKER_PALETTE } from '@/lib/tracker';

interface ILabelPickerProps {
  value: string[];
  onChange: (labelIds: string[]) => void;
  trigger: ReactNode;
}

/** Метки: несколько сразу; новую можно завести прямо отсюда. */
export const LabelPicker = ({ value, onChange, trigger }: ILabelPickerProps) => {
  const { list } = useLabels();
  const queryClient = useQueryClient();
  const createLabel = useCreateLabel();
  const [draft, setDraft] = useState('');

  const options = useMemo(
    () =>
      list.map((label) => ({
        value: label.id,
        label: label.name,
        icon: <span className="h-3 w-3 rounded-full" style={{ background: label.color }} />,
      })),
    [list],
  );

  const toggle = (labelId: string) =>
    onChange(value.includes(labelId) ? value.filter((id) => id !== labelId) : [...value, labelId]);

  const create = async () => {
    const name = draft.trim();
    if (!name) return;
    try {
      const color = TRACKER_PALETTE[list.length % TRACKER_PALETTE.length];
      const result = await createLabel.mutateAsync({ data: { name, color } });
      await queryClient.invalidateQueries({ queryKey: getListLabelsQueryKey() });
      onChange([...value, result.data.id]);
      setDraft('');
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Не удалось создать метку'));
    }
  };

  return (
    <AdaptivePicker
      title="Метки"
      options={options}
      selected={value}
      multiple
      searchable={list.length > 6}
      onSelect={toggle}
      trigger={trigger}
      emptyText="Меток пока нет"
      footer={() => (
        <form
          className="flex items-center gap-2 border-t border-black/[0.06] p-2"
          onSubmit={(event) => {
            event.preventDefault();
            void create();
          }}
        >
          <Input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Новая метка" className="h-9 text-sm" maxLength={40} />
          <button
            type="submit"
            disabled={!draft.trim() || createLabel.isPending}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white disabled:opacity-40"
            aria-label="Создать метку"
          >
            <Plus className="h-4 w-4" />
          </button>
        </form>
      )}
    />
  );
};
