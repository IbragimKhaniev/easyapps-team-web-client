import { useEffect, useState } from 'react';

import type { Task } from '@/api/models';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Checkbox } from '@/components/ui/checkbox';
import { COMMENT_FORMS, HISTORY_FORMS, pluralize, WORK_FORMS } from '@/lib/plural';
import { useTaskAdminActions } from '../hooks/useTaskAdminActions';

interface ITaskPurgeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Pick<Task, 'key' | 'title' | 'commentsCount'>;
  /** Работ агентов над задачей — галочка «удалить и их». */
  worksCount: number;
  /** Записей истории; не знаем — пишем без числа. */
  historyCount?: number;
  onPurged?: () => void;
}

/**
 * Удалить задачу из архива насовсем (администратор). Что уйдёт — прямо в окне:
 * комментарии, история и, по галочке, работы агентов; без галочки работы
 * остаются в журнале без задачи.
 */
export const TaskPurgeDialog = ({ open, onOpenChange, task, worksCount, historyCount, onPurged }: ITaskPurgeDialogProps) => {
  const { purgeTask } = useTaskAdminActions();
  const [withWork, setWithWork] = useState(true);

  useEffect(() => {
    if (open) setWithWork(true);
  }, [open]);

  const gone = [
    task.commentsCount ? pluralize(task.commentsCount, COMMENT_FORMS) : null,
    historyCount === undefined ? 'история' : historyCount ? pluralize(historyCount, HISTORY_FORMS) : null,
  ].filter(Boolean);

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Удалить ${task.key} насовсем?`}
      description={(
        <>
          <span className="font-semibold text-ink">«{task.title}»</span>
          {gone.length ? `. Вместе с ней удалится всё, что к ней относится: ${gone.join(' и ')}.` : '.'} Отменить это
          нельзя — задача пропадёт из архива, поиска и старых ссылок.
        </>
      )}
      confirmLabel="Удалить насовсем"
      onConfirm={async () => {
        const done = await purgeTask(task.key, withWork);
        if (done) onPurged?.();
        return done;
      }}
    >
      {worksCount > 0 && (
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-secondary px-3.5 py-3 text-[14px] leading-snug text-ink">
          <Checkbox checked={withWork} onCheckedChange={(checked) => setWithWork(checked === true)} className="mt-0.5" />
          <span>
            Удалить и работы агентов по задаче — {pluralize(worksCount, WORK_FORMS)}
            <span className="mt-0.5 block text-[12.5px] text-ink-muted">
              {withWork ? 'Работы со всем ходом пропадут из журнала и разбора.' : 'Работы останутся в журнале — уже без задачи.'}
            </span>
          </span>
        </label>
      )}
    </ConfirmDialog>
  );
};
