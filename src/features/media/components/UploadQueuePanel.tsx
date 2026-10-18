import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ChevronDown, CircleAlert, UploadCloud, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { uploadQueue, useUploadItems } from '../hooks/uploadQueue';
import { formatBytes } from '../lib/format';

/**
 * Загрузки медиатеки — плавающая карточка, как в Google Drive: видна с
 * любого экрана, пока идёт загрузка, и показывает итог.
 */
export const UploadQueuePanel = () => {
  const items = useUploadItems();
  const [collapsed, setCollapsed] = useState(false);
  const active = items.filter((item) => item.status === 'uploading' || item.status === 'queued');
  const failed = items.filter((item) => item.status === 'error');

  const title = active.length
    ? `Загружается ${active.length}…`
    : failed.length
      ? `Не загрузилось: ${failed.length}`
      : 'Загрузки готовы';

  return (
    <AnimatePresence>
      {items.length > 0 && (
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          className={cn(
            'fixed z-[60] w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-card bg-white shadow-float',
            'bottom-[calc(var(--tabbar-height)+var(--safe-bottom)+20px)] right-4 lg:bottom-8 lg:right-8',
          )}
        >
          <header className="flex items-center gap-2 px-4 py-3">
            <UploadCloud className="h-5 w-5 text-brand-800" />
            <span className="flex-1 text-[14px] font-bold text-ink">{title}</span>
            <Button variant="ghost" size="icon-sm" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? 'Развернуть' : 'Свернуть'}>
              <ChevronDown className={cn('transition-transform', collapsed && 'rotate-180')} />
            </Button>
            {!active.length && (
              <Button variant="ghost" size="icon-sm" onClick={() => uploadQueue.clearFinished()} aria-label="Скрыть">
                <X />
              </Button>
            )}
          </header>
          {!collapsed && (
            <ul className="max-h-72 overflow-y-auto border-t border-black/[0.06]">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-ink">{item.fileName}</span>
                    {item.status === 'error' ? (
                      <span className="block truncate text-[12px] text-rose-600">{item.error}</span>
                    ) : item.status === 'uploading' ? (
                      <Progress value={Math.round(item.progress * 100)} className="mt-1.5 h-1.5" />
                    ) : (
                      <span className="block text-[12px] text-ink-muted">{item.status === 'queued' ? 'В очереди' : formatBytes(item.size)}</span>
                    )}
                  </span>
                  {item.status === 'done' && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />}
                  {item.status === 'error' && (
                    <button type="button" onClick={() => uploadQueue.dismiss(item.id)} aria-label="Убрать" className="text-ink-faint hover:text-ink">
                      <CircleAlert className="h-5 w-5 text-rose-500" />
                    </button>
                  )}
                  {item.status === 'uploading' && <span className="w-9 text-right text-[12px] font-bold text-ink-muted tabular">{Math.round(item.progress * 100)}%</span>}
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
