import { useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { getListLabelsQueryKey, useArchiveLabel, useCreateLabel, useUpdateLabel } from '@/api/generated/labels/labels';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLabels } from '@/hooks/useDirectory';
import { apiErrorMessage } from '@/lib/errors';
import { TRACKER_PALETTE } from '@/lib/tracker';
import { ColorSwatches } from './ColorSwatches';

/** Метки задач: общие на все проекты. */
export const LabelsSettings = () => {
  const queryClient = useQueryClient();
  const { list } = useLabels();
  const createLabel = useCreateLabel();
  const updateLabel = useUpdateLabel();
  const archiveLabel = useArchiveLabel();
  const [name, setName] = useState('');

  const refresh = () => queryClient.invalidateQueries({ queryKey: getListLabelsQueryKey() });

  const run = async (action: () => Promise<unknown>, failure: string) => {
    try {
      await action();
      await refresh();
    } catch (error) {
      toast.error(apiErrorMessage(error, failure));
    }
  };

  return (
    <Card title="Метки">
      <form
        className="mb-3 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const trimmed = name.trim();
          if (!trimmed) return;
          void run(async () => {
            await createLabel.mutateAsync({ data: { name: trimmed, color: TRACKER_PALETTE[list.length % TRACKER_PALETTE.length] } });
            setName('');
          }, 'Не удалось создать метку');
        }}
      >
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Новая метка" maxLength={40} />
        <Button type="submit" size="icon" disabled={!name.trim()} aria-label="Добавить метку">
          <Plus />
        </Button>
      </form>
      <ul className="flex flex-col divide-y divide-black/[0.05]">
        {list.map((label) => (
          <li key={label.id} className="flex items-center gap-3 py-2">
            <ColorSwatches compact value={label.color} onChange={(color) => void run(() => updateLabel.mutateAsync({ id: label.id, data: { color } }), 'Не удалось сменить цвет')} />
            <span className="flex-1 text-[15px] font-semibold text-ink">{label.name}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => void run(() => archiveLabel.mutateAsync({ id: label.id }), 'Не удалось удалить метку')}
              aria-label="Удалить метку"
            >
              <Trash2 />
            </Button>
          </li>
        ))}
        {!list.length && <li className="py-3 text-[14px] text-ink-faint">Меток пока нет</li>}
      </ul>
    </Card>
  );
};
