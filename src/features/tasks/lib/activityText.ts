import { ActivityType, type Activity, type Label, type TaskPriority, type TaskStatus, type TeamMember } from '@/api/models';
import { formatLongDate } from '@/lib/dates';
import { PRIORITY_META, STATUS_META } from '@/lib/tracker';

interface IDirectory {
  members: Map<string, TeamMember>;
  labels: Map<string, Label>;
}

interface IChecklistSummary {
  done: number;
  total: number;
}

const asString = (value: unknown): string | null => (typeof value === 'string' ? value : null);

/**
 * Запись истории — человеческой фразой без родов глагола
 * («статус: В работе → Готово», а не «перевела»).
 */
export const describeActivity = (activity: Activity, { members, labels }: IDirectory): string => {
  const from = activity.from;
  const to = activity.to;

  switch (activity.type) {
    case ActivityType.created:
      return 'создание задачи';
    case ActivityType.title_changed:
      return `название: «${asString(to) ?? ''}»`;
    case ActivityType.description_changed:
      return 'описание обновлено';
    case ActivityType.status_changed: {
      const before = asString(from) as TaskStatus | null;
      const after = asString(to) as TaskStatus | null;
      return `статус: ${before ? STATUS_META[before]?.label : '—'} → ${after ? STATUS_META[after]?.label : '—'}`;
    }
    case ActivityType.priority_changed: {
      const after = asString(to) as TaskPriority | null;
      return `приоритет: ${after ? PRIORITY_META[after]?.label : '—'}`;
    }
    case ActivityType.assignee_changed: {
      const after = asString(to);
      return after ? `исполнитель: ${members.get(after)?.name ?? 'участник'}` : 'исполнитель снят';
    }
    case ActivityType.due_date_changed: {
      const after = asString(to);
      return after ? `срок: ${formatLongDate(after)}` : 'срок снят';
    }
    case ActivityType.labels_changed: {
      const after = Array.isArray(to) ? (to as string[]) : [];
      const names = after.map((id) => labels.get(id)?.name).filter(Boolean);
      return names.length ? `метки: ${names.join(', ')}` : 'метки сняты';
    }
    case ActivityType.project_changed:
      return `перенос: ${asString(from) ?? ''} → ${asString(to) ?? ''}`;
    case ActivityType.checklist_changed: {
      const summary = to as IChecklistSummary | null;
      return summary ? `чек-лист: ${summary.done} из ${summary.total}` : 'чек-лист изменён';
    }
    case ActivityType.commented:
      return 'комментарий';
    case ActivityType.archived:
      return 'в архив';
    case ActivityType.restored:
      return 'из архива';
    default:
      return 'изменение';
  }
};
