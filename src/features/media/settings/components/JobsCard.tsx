import { Activity, Loader2, Play } from 'lucide-react';

import { useListMediaJobs } from '@/api/generated/media-integrations/media-integrations';
import type { MediaJob } from '@/api/models';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/ui/button';
import { timeAgo } from '@/lib/dates';
import { cn } from '@/lib/utils';
import type { useIntegrationActions } from '../hooks/useIntegrationActions';

/** Задачи перечитываются часто: видно, как задача пошла и чем закончилась. */
const JOBS_REFRESH_MS = 5_000;

const MINUTE_MS = 60_000;

/** 15000 → «каждые 15 с», 1800000 → «каждые 30 мин», 21600000 → «каждые 6 ч». */
const intervalText = (ms: number): string => {
  if (ms < MINUTE_MS) return `каждые ${Math.round(ms / 1000)} с`;
  if (ms < 60 * MINUTE_MS) return `каждые ${Math.round(ms / MINUTE_MS)} мин`;
  if (ms < 24 * 60 * MINUTE_MS) return `каждые ${Math.round(ms / (60 * MINUTE_MS))} ч`;
  return 'раз в сутки';
};

const statusTone = (job: MediaJob): string => {
  if (job.running) return 'bg-amber-500 animate-pulse';
  if (job.lastStatus === 'error') return 'bg-rose-500';
  if (job.lastStatus === 'ok') return 'bg-emerald-500';
  return 'bg-ink-faint';
};

/** Фоновые задачи: публикация по расписанию и сборщики статистики — когда шли, чем закончились, запуск вручную. */
export const JobsCard = ({ actions }: { actions: ReturnType<typeof useIntegrationActions> }) => {
  const { data, isLoading } = useListMediaJobs({ query: { refetchInterval: JOBS_REFRESH_MS } });
  const jobs = data?.data ?? [];

  return (
    <Card title={<span className="flex items-center gap-2"><Activity className="h-5 w-5 text-brand-800" /> Фоновые задачи</span>}>
      {isLoading ? (
        <div className="skeleton h-40 rounded-2xl" />
      ) : jobs.length ? (
        <ul className="flex flex-col divide-y divide-black/[0.06]">
          {jobs.map((job) => (
            <li key={job.name} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <span className={cn('mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full', statusTone(job))} />
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] font-bold text-ink">{job.title}</span>
                <span className="block text-[12px] text-ink-muted">
                  {intervalText(job.intervalMs)} · {job.running ? 'идёт сейчас' : job.lastFinishedAt ? `была ${timeAgo(job.lastFinishedAt)}` : 'ещё не запускалась'}
                </span>
                {job.lastError ? (
                  <span className="mt-1 block text-[12px] leading-snug text-rose-700">{job.lastError}</span>
                ) : job.lastSummary ? (
                  <span className="mt-1 block text-[12px] leading-snug text-ink-soft">{job.lastSummary}</span>
                ) : null}
              </span>
              <Button variant="ghost" size="icon-sm" onClick={() => void actions.runNow(job.name)} disabled={job.running} aria-label={`Запустить «${job.title}» сейчас`}>
                {job.running ? <Loader2 className="animate-spin" /> : <Play />}
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[13px] text-ink-muted">Фоновые задачи выключены на сервере (TEAM_JOBS_ENABLED=false).</p>
      )}
    </Card>
  );
};
