import logoSvg from '@/assets/easyapps-logo.svg';
import { cn } from '@/lib/utils';

interface ILogoProps {
  className?: string;
  /** Подпись «team» рядом со словом. */
  withTeam?: boolean;
}

/** Полумесяц easyapps и слово; «apps» — фирменным голубым. */
export const Logo = ({ className, withTeam = true }: ILogoProps) => (
  <span className={cn('flex items-center gap-2.5', className)}>
    <img src={logoSvg} alt="" className="h-8 w-8" />
    <span className="text-[22px] font-bold tracking-tight text-ink">
      easy<span className="text-brand">apps</span>
    </span>
    {withTeam && (
      <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
        team
      </span>
    )}
  </span>
);
