import { AlertTriangle, CircleAlert } from 'lucide-react';

import type { PostIssue } from '@/api/models';
import { cn } from '@/lib/utils';

/** Что помешает посту выйти (красное) и подсказки (жёлтое) — от сервера, как он проверит в момент публикации. */
export const IssuesList = ({ issues, className }: { issues: PostIssue[]; className?: string }) => {
  if (!issues.length) return null;
  const sorted = [...issues].sort((a, b) => (a.level === b.level ? 0 : a.level === 'error' ? -1 : 1));
  return (
    <ul className={cn('flex flex-col gap-1.5', className)}>
      {sorted.map((issue, index) => (
        <li
          key={`${issue.message}-${index}`}
          className={cn(
            'flex items-start gap-2 rounded-xl px-3 py-2 text-[13px] leading-snug',
            issue.level === 'error' ? 'bg-rose-50 text-rose-800' : 'bg-amber-50 text-amber-800',
          )}
        >
          {issue.level === 'error' ? <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
          {issue.message}
        </li>
      ))}
    </ul>
  );
};
