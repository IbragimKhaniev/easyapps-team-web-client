import type { IntegrationStatus } from '@/api/models';
import { cn } from '@/lib/utils';

const META: Record<IntegrationStatus, { label: string; className: string }> = {
  connected: { label: 'Подключено', className: 'bg-emerald-50 text-emerald-700' },
  error: { label: 'Ошибка', className: 'bg-rose-50 text-rose-700' },
  not_configured: { label: 'Не настроено', className: 'bg-black/[0.05] text-ink-soft' },
};

export const IntegrationStatusPill = ({ status, enabled }: { status: IntegrationStatus; enabled: boolean }) => {
  const meta = enabled ? META[status] : { label: 'Выключено', className: 'bg-black/[0.05] text-ink-muted' };
  return <span className={cn('inline-flex h-6 items-center rounded-full px-2.5 text-[12px] font-bold', meta.className)}>{meta.label}</span>;
};
