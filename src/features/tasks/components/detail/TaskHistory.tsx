import { useListTaskActivity } from '@/api/generated/activity/activity';
import { MemberAvatar } from '@/components/common/MemberAvatar';
import { useLabels, useMembers } from '@/hooks/useDirectory';
import { formatDateTime } from '@/lib/dates';
import { describeActivity } from '../../lib/activityText';

/** История задачи: кто и что менял, по времени. */
export const TaskHistory = ({ taskKey }: { taskKey: string }) => {
  const { data } = useListTaskActivity(taskKey);
  const { map: members } = useMembers();
  const { map: labels } = useLabels();
  const items = [...(data?.data ?? [])].reverse();

  if (!items.length) return <p className="text-[14px] text-ink-faint">Истории пока нет</p>;

  return (
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
              <div className="mt-0.5 text-[12px] text-ink-faint">{formatDateTime(item.createdAt)}</div>
            </div>
          </li>
        );
      })}
    </ol>
  );
};
