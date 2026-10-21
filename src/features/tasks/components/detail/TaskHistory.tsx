import { Bot, Eraser } from 'lucide-react';
import { useState } from 'react';

import { useListTaskActivity } from '@/api/generated/activity/activity';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { MemberAvatar } from '@/components/common/MemberAvatar';
import { Button } from '@/components/ui/button';
import { useWorkParam } from '@/features/agents/hooks/useWorkParam';
import { useLabels, useMembers } from '@/hooks/useDirectory';
import { useSession } from '@/hooks/useSession';
import { formatDateTime } from '@/lib/dates';
import { ENTRY_FORMS, HISTORY_FORMS, pluralize } from '@/lib/plural';
import { useTaskAdminActions } from '../../hooks/useTaskAdminActions';
import { describeActivity } from '../../lib/activityText';

/** История задачи: кто и что менял, по времени. Администратор может её очистить. */
export const TaskHistory = ({ taskKey }: { taskKey: string }) => {
  const { data } = useListTaskActivity(taskKey);
  const { map: members } = useMembers();
  const { map: labels } = useLabels();
  const { openWork } = useWorkParam();
  const { isAdmin } = useSession();
  const { clearHistory } = useTaskAdminActions();
  const [clearing, setClearing] = useState(false);
  const items = [...(data?.data ?? [])].reverse();

  if (!items.length) return <p className="text-[14px] text-ink-faint">Истории пока нет</p>;

  return (
    <div className="flex flex-col gap-4">
      {isAdmin && (
        <div className="flex items-center justify-between gap-3">
          <span className="text-[12.5px] text-ink-faint">{pluralize(items.length, HISTORY_FORMS)}</span>
          <Button variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => setClearing(true)}>
            <Eraser /> Очистить историю
          </Button>
        </div>
      )}
      <ol className="relative flex flex-col gap-4 pl-1">
        <span className="absolute bottom-2 left-[13px] top-2 w-px bg-black/[0.08]" aria-hidden />
        {items.map((item) => {
          const actor = members.get(item.actorId);
          return (
            <li key={item.id} className="relative flex items-start gap-3">
              <MemberAvatar member={actor} size="xs" className="relative z-10" />
              <div className="min-w-0 flex-1 text-[13.5px] leading-snug">
                <span className="font-bold text-ink">{actor?.name ?? 'Участник'}</span>
                <span className="text-ink-soft"> — {describeActivity(item, { members, labels })}</span>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[12px] text-ink-faint">
                  {formatDateTime(item.createdAt)}
                  {item.via && (
                    <button
                      type="button"
                      disabled={!item.via.journalSessionId}
                      onClick={() => item.via?.journalSessionId && openWork(item.via.journalSessionId)}
                      className="inline-flex items-center gap-1 font-semibold text-brand-800 enabled:hover:underline"
                      title={item.via.journalSessionId ? 'Открыть работу в журнале' : undefined}
                    >
                      <Bot className="h-3 w-3" /> через {item.via.client}
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {isAdmin && (
        <ConfirmDialog
          open={clearing}
          onOpenChange={setClearing}
          title={`Очистить историю ${taskKey}?`}
          description={`История задачи — ${pluralize(items.length, ENTRY_FORMS)} — удалится вместе с её строками в «что нового» сводки. Сама задача, комментарии и работы агентов останутся. Отменить нельзя.`}
          confirmLabel="Очистить историю"
          onConfirm={() => clearHistory(taskKey)}
        />
      )}
    </div>
  );
};
