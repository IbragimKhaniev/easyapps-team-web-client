import { CornerDownLeft, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useListTasks } from '@/api/generated/tasks/tasks';
import { NAV_SECTIONS } from '@/app/navigation';
import { uiActions, useUiState } from '@/app/uiStore';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { StatusIcon } from '@/features/tasks/components/StatusIcon';
import { useTaskParam } from '@/features/tasks/hooks/useTaskParam';
import { useDebounce } from '@/hooks/useDebounce';

const SEARCH_LIMIT = 8;
const MIN_QUERY = 2;

const itemClass = 'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14.5px] data-[selected=true]:bg-brand-50';

/**
 * ⌘K: найти задачу по ключу или названию и перейти в любой раздел — с
 * клавиатуры, не трогая мышь. Подсказки клавиш — справа у пунктов.
 */
export const CommandPalette = () => {
  const open = useUiState((state) => state.palette.open);
  const navigate = useNavigate();
  const { openTask } = useTaskParam();
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query.trim());

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const { data, isFetching } = useListTasks(
    { q: debounced, limit: SEARCH_LIMIT, sort: 'updated' },
    { query: { enabled: open && debounced.length >= MIN_QUERY } },
  );
  const tasks = debounced.length >= MIN_QUERY ? data?.data.items ?? [] : [];

  const run = (action: () => void) => {
    uiActions.closePalette();
    action();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && uiActions.closePalette()}>
      <DialogContent className="top-[18%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0" showCloseButton={false}>
        <DialogTitle className="sr-only">Поиск и команды</DialogTitle>
        <Command shouldFilter={false} className="bg-transparent">
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Задача, ключ EA-42 или раздел…"
            className="h-14 text-[16px]"
          />
          <CommandList className="max-h-[60vh] p-2">
            <CommandEmpty>{isFetching ? 'Ищем…' : 'Ничего не нашлось'}</CommandEmpty>

            {tasks.length > 0 && (
              <CommandGroup heading="Задачи">
                {tasks.map((task) => (
                  <CommandItem key={task.id} value={`task-${task.key}`} onSelect={() => run(() => openTask(task.key))} className={itemClass}>
                    <StatusIcon status={task.status} />
                    <span className="w-16 shrink-0 font-mono text-[12px] text-ink-faint">{task.key}</span>
                    <span className="flex-1 truncate font-semibold">{task.title}</span>
                    <CornerDownLeft className="h-4 w-4 text-ink-faint" />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            <CommandGroup heading="Действия">
              <CommandItem value="new-task" onSelect={() => run(() => uiActions.openQuickAdd())} className={itemClass}>
                <Plus className="h-[18px] w-[18px] text-brand-800" />
                <span className="flex-1 font-semibold">Новая задача</span>
                <kbd className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-ink-muted">C</kbd>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator className="my-1" />
            {NAV_SECTIONS.map((section) => (
              <CommandGroup key={section.title} heading={section.title}>
                {section.items
                  .filter((item) => !query || item.label.toLowerCase().includes(query.toLowerCase()))
                  .map((item) => (
                    <CommandItem key={item.to} value={`nav-${item.to}`} onSelect={() => run(() => navigate(item.to))} className={itemClass}>
                      <item.icon className="h-[18px] w-[18px] text-ink-muted" />
                      <span className="flex-1">{item.label}</span>
                    </CommandItem>
                  ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};
