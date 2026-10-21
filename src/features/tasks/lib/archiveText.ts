import type { TaskPurgeResult } from '@/api/models';
import { COMMENT_FORMS, HISTORY_FORMS, pluralize, WORK_FORMS } from '@/lib/plural';

/** Итог удаления насовсем одной строкой: «EA-12 удалена: 3 комментария, 12 записей истории, 2 работы». */
export const purgeSummary = (result: TaskPurgeResult): string => {
  const gone = [
    result.comments ? pluralize(result.comments, COMMENT_FORMS) : null,
    result.history ? pluralize(result.history, HISTORY_FORMS) : null,
    result.worksDeleted ? `${pluralize(result.worksDeleted, WORK_FORMS)} агентов` : null,
  ].filter(Boolean);
  const kept = result.worksDetached ? ` · ${pluralize(result.worksDetached, WORK_FORMS)} — в журнале без задачи` : '';
  return `${result.key} удалена насовсем${gone.length ? `: ${gone.join(', ')}` : ''}${kept}`;
};
