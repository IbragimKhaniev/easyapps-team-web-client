import { CalendarCheck, CalendarX2, Lightbulb, Loader2, Save, Send } from 'lucide-react';

import type { MediaPostStatus } from '@/api/models';
import { Button } from '@/components/ui/button';
import { formatLongDate } from '@/lib/dates';
import { cn } from '@/lib/utils';
import type { TPostAction } from '../hooks/usePostActions';

interface IComposerActionsProps {
  status: MediaPostStatus | null;
  editable: boolean;
  dirty: boolean;
  busy: TPostAction | null;
  date: string;
  time: string;
  /** Есть ли что публиковать: хотя бы одна площадка. */
  canPublish: boolean;
  /** Телефон: главная кнопка во всю ширину, остальные — рядом под ней. */
  compact: boolean;
  onSave: () => void;
  /** Только у нового поста: записать строкой плана без содержимого. */
  onSaveIdea?: () => void;
  onSchedule: () => void;
  onUnschedule: () => void;
  onPublishNow: () => void;
}

const icon = (active: boolean, Icon: typeof Save) => (active ? <Loader2 className="animate-spin" /> : <Icon />);

/** Действия поста по его статусу: черновик — сохранить, запланировать, опубликовать; запланированный — снять. */
export const ComposerActions = ({
  status,
  editable,
  dirty,
  busy,
  date,
  time,
  canPublish,
  compact,
  onSave,
  onSaveIdea,
  onSchedule,
  onUnschedule,
  onPublishNow,
}: IComposerActionsProps) => {
  const anyBusy = busy !== null;
  const scheduled = status === 'scheduled';
  const size = compact ? 'sm' : 'md';

  const secondary = [
    onSaveIdea && (
      <Button key="idea" variant="ghost" size={size} onClick={onSaveIdea} disabled={anyBusy}>
        <Lightbulb /> Идеей
      </Button>
    ),
    <Button key="save" variant="ghost" size={size} onClick={onSave} disabled={anyBusy || (status !== null && !dirty)}>
      {icon(busy === 'save', Save)} {status === null ? 'Черновик' : 'Сохранить'}
    </Button>,
    editable && (scheduled ? (
      <Button key="unschedule" variant="soft" size={size} onClick={onUnschedule} disabled={anyBusy}>
        {icon(busy === 'unschedule', CalendarX2)} Снять
      </Button>
    ) : (
      <Button key="publish" variant="soft" size={size} onClick={onPublishNow} disabled={anyBusy || !canPublish}>
        {icon(busy === 'publish', Send)} {compact ? 'Сейчас' : 'Опубликовать сейчас'}
      </Button>
    )),
  ].filter(Boolean);

  const primary = editable && (
    <Button onClick={onSchedule} disabled={anyBusy || !canPublish} className={cn(compact && 'w-full')}>
      {icon(busy === 'schedule', CalendarCheck)}
      {scheduled ? 'Перепланировать' : 'Запланировать'} · {formatLongDate(date)}, {time}
    </Button>
  );

  if (compact) {
    return (
      <div className="flex flex-col gap-2">
        {primary}
        <div className="flex items-center justify-between gap-1">{secondary}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {onSaveIdea && <span className="mr-auto">{secondary[0]}</span>}
      {onSaveIdea ? secondary.slice(1) : secondary}
      {primary}
    </div>
  );
};
