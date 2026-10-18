import { LogOut } from 'lucide-react';

import { Card } from '@/components/common/Card';
import { MemberAvatar } from '@/components/common/MemberAvatar';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { useLogoutAction } from '@/features/auth/useLogoutAction';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useSession } from '@/hooks/useSession';
import { cn } from '@/lib/utils';
import { LabelsSettings } from './LabelsSettings';
import { ProjectsSettings } from './ProjectsSettings';

const ROLE_LABEL = { admin: 'Администратор', manager: 'Менеджер' } as const;

/** Настройки: профиль, проекты, метки. */
export const SettingsPage = () => {
  const { user } = useSession();
  const isDesktop = useIsDesktop();
  const logout = useLogoutAction();

  return (
    <div className="animate-fade-up">
      <PageHeader title="Настройки" subtitle="Профиль, проекты и метки задач" backTo={isDesktop ? undefined : '/more'} />
      <div className={cn('grid gap-5 xl:grid-cols-2', !isDesktop && 'px-4')}>
        {user && (
          <Card title="Профиль" className="xl:col-span-2">
            <div className="flex flex-wrap items-center gap-4">
              <MemberAvatar member={user} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="text-[17px] font-bold text-ink">{user.name}</div>
                <div className="text-[14px] text-ink-muted">
                  {user.email} · {ROLE_LABEL[user.role]}
                </div>
                <p className="mt-1 text-[12.5px] text-ink-faint">Имя, фото и пароль меняются в профиле на easyapps.click.</p>
              </div>
              <Button variant="outline" onClick={() => void logout()}>
                <LogOut /> Выйти
              </Button>
            </div>
          </Card>
        )}
        <ProjectsSettings />
        <LabelsSettings />
      </div>
    </div>
  );
};
