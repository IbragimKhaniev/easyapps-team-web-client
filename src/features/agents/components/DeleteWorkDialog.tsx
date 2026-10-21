import type { JournalSession } from '@/api/models';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ENTRY_FORMS, pluralize } from '@/lib/plural';
import { useJournalAdminActions } from '../hooks/useJournalAdminActions';

interface IDeleteWorkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  work: Pick<JournalSession, 'id' | 'title' | 'status' | 'taskKey' | 'counts'>;
  onDeleted?: () => void;
}

const entriesOf = (counts: JournalSession['counts']): number => Object.values(counts).reduce((sum, value) => sum + value, 0);

/**
 * Удалить работу журнала со всем ходом (администратор). Живую — тоже: агент на
 * следующей записи получит «работа не найдена» и откроет новую.
 */
export const DeleteWorkDialog = ({ open, onOpenChange, work, onDeleted }: IDeleteWorkDialogProps) => {
  const { deleteWork } = useJournalAdminActions();
  const entries = entriesOf(work.counts);

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Удалить работу?"
      description={(
        <>
          <span className="font-semibold text-ink">«{work.title}»</span>
          {entries ? ` — со всем ходом: ${pluralize(entries, ENTRY_FORMS)}.` : '.'}
          {work.status === 'active' && ' Работа идёт сейчас: агент на следующей записи получит «работа не найдена» и откроет новую.'}
          {work.taskKey ? ` Задача ${work.taskKey} останется.` : ''} Отменить нельзя.
        </>
      )}
      confirmLabel="Удалить работу"
      onConfirm={async () => {
        const done = await deleteWork(work.id);
        if (done) onDeleted?.();
        return done;
      }}
    />
  );
};
