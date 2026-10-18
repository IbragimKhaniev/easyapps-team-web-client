import { LogOut, Plus, Search, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

import { PATHS } from '@/app/paths';
import { uiActions } from '@/app/uiStore';
import { MemberAvatar } from '@/components/common/MemberAvatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLogoutAction } from '@/features/auth/useLogoutAction';
import { useSession } from '@/hooks/useSession';

const ROLE_LABEL = { admin: 'Администратор', manager: 'Менеджер' } as const;

/** Верхняя панель компьютера: поиск (⌘K), новая задача, профиль. */
export const Topbar = () => {
  const { user } = useSession();
  const logout = useLogoutAction();

  return (
    <header className="flex h-[76px] shrink-0 items-center gap-4 rounded-card bg-panel px-5">
      <button
        type="button"
        onClick={uiActions.openPalette}
        className="flex h-12 w-full max-w-[380px] items-center gap-3 rounded-full bg-white px-4 text-left text-[15px] text-ink-faint shadow-card transition-shadow hover:shadow-float"
      >
        <Search className="h-5 w-5 text-ink-soft" />
        <span className="flex-1">Найти задачу или действие</span>
        <kbd className="rounded-md bg-secondary px-2 py-1 font-mono text-[11px] font-medium text-ink-soft">⌘ K</kbd>
      </button>

      <div className="ml-auto flex items-center gap-3">
        <Button variant="white" size="icon-lg" onClick={() => uiActions.openQuickAdd()} aria-label="Новая задача" title="Новая задача (C)">
          <Plus />
        </Button>
        <Button variant="white" size="icon-lg" asChild aria-label="Настройки">
          <Link to={PATHS.settings}>
            <Settings />
          </Link>
        </Button>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 rounded-full py-1 pl-1 pr-3 text-left transition-colors hover:bg-white/70">
              <MemberAvatar member={user} size="lg" />
              <span className="hidden flex-col xl:flex">
                <span className="text-[15px] font-bold leading-tight text-ink">{user.name}</span>
                <span className="text-[13px] leading-tight text-ink-muted">{user.email}</span>
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2.5 py-2">
                <div className="text-sm font-bold text-ink">{user.name}</div>
                <div className="text-xs text-ink-muted">{ROLE_LABEL[user.role]}</div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={PATHS.settings}>
                  <Settings className="mr-2 h-4 w-4" /> Настройки
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={logout}>
                <LogOut className="mr-2 h-4 w-4" /> Выйти
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};
