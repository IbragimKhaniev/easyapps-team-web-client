import { ChevronRight, LogOut, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

import { NAV_SECTIONS } from '@/app/navigation';
import { PATHS } from '@/app/paths';
import { MemberAvatar } from '@/components/common/MemberAvatar';
import { InstallHintDialog } from '@/components/layout/InstallHintDialog';
import { PageHeader } from '@/components/layout/PageHeader';
import { useLogoutAction } from '@/features/auth/useLogoutAction';
import { useSession } from '@/hooks/useSession';

/** Пункты, которых нет в таббаре: разделы, настройки, выход — списком как в «Настройках» iOS. */
const IN_TABBAR = new Set<string>([PATHS.overview, PATHS.tasks, PATHS.media.plan]);

const rowClass = 'flex min-h-[54px] items-center gap-3 px-4 text-[17px] text-ink active:bg-black/[0.04]';

export const MorePage = () => {
  const { user } = useSession();
  const logout = useLogoutAction();

  return (
    <div className="animate-fade-up">
      <PageHeader title="Ещё" />
      <div className="flex flex-col gap-6 px-4">
        {user && (
          <Link to={PATHS.settings} className="card-surface flex items-center gap-3 p-4">
            <MemberAvatar member={user} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[17px] font-bold text-ink">{user.name}</div>
              <div className="truncate text-[14px] text-ink-muted">{user.email}</div>
            </div>
            <ChevronRight className="h-5 w-5 text-ink-faint" />
          </Link>
        )}

        {NAV_SECTIONS.map((section) => {
          const items = section.items.filter((item) => !IN_TABBAR.has(item.to));
          if (!items.length) return null;
          return (
            <section key={section.title}>
              <h2 className="mb-2 px-4 text-[13px] font-semibold uppercase tracking-[0.06em] text-ink-faint">{section.title}</h2>
              <div className="card-surface divide-y divide-black/[0.05] overflow-hidden">
                {items.map((item) => (
                  <Link key={item.to} to={item.to} className={rowClass}>
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-800">
                      <item.icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="flex-1">{item.label}</span>
                    <ChevronRight className="h-5 w-5 text-ink-faint" />
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        <div className="card-surface divide-y divide-black/[0.05] overflow-hidden">
          <InstallHintDialog
            trigger={
              <button type="button" className={`${rowClass} w-full text-left`}>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-800">
                  <Smartphone className="h-[18px] w-[18px]" />
                </span>
                <span className="flex-1">Установить на iPhone</span>
                <ChevronRight className="h-5 w-5 text-ink-faint" />
              </button>
            }
          />
          <button type="button" onClick={() => void logout()} className={`${rowClass} w-full text-left text-rose-600`}>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50">
              <LogOut className="h-[18px] w-[18px]" />
            </span>
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
};
