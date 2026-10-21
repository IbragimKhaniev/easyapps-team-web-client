import type { PurgeJournalSessionsBody } from '@/api/models';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { pluralize, WORK_FORMS } from '@/lib/plural';
import { useJournalAdminActions } from '../hooks/useJournalAdminActions';

interface IPurgeJournalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Фильтр ленты — тем же телом уходит на сервер. */
  body: PurgeJournalSessionsBody;
  /** Сколько закрытых работ под фильтром — число из ленты. */
  total: number;
  /** Фильтр словами: «за 30 дней · Иван · Сделано». */
  scope: string;
}

/**
 * Очистить журнал (администратор): закрытые работы под фильтром ленты — со
 * всем ходом. Живые работы не трогаем: их удаляют по одной, из карточки.
 */
export const PurgeJournalDialog = ({ open, onOpenChange, body, total, scope }: IPurgeJournalDialogProps) => {
  const { purgeWorks } = useJournalAdminActions();

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Удалить ${pluralize(total, WORK_FORMS)} из журнала?`}
      description={(
        <>
          Под фильтром <span className="font-semibold text-ink">{scope}</span> — закрытые работы со всем ходом. Они
          пропадут из журнала, разбора и карточек задач. Идущие сейчас работы останутся. Отменить нельзя.
        </>
      )}
      confirmLabel="Удалить работы"
      onConfirm={() => purgeWorks(body)}
    />
  );
};
