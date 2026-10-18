import type { TeamMember } from '@/api/models';
import { cn } from '@/lib/utils';

/** Цвета фона инициалов — стабильно по id, чтобы человек всегда был одного цвета. */
const AVATAR_TINTS = ['#DDF3FD', '#E9E3FF', '#FFE4D6', '#DDF5E6', '#FFF1C2', '#FDE2EC', '#E3E8F0'];
const AVATAR_INKS = ['#0B6A92', '#5B3FD1', '#B4501E', '#17803D', '#9A6B00', '#B4235A', '#475569'];

const hashOf = (value: string): number => [...value].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7);

const initialsOf = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?';

const SIZES = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
} as const;

interface IMemberAvatarProps {
  member?: Pick<TeamMember, 'id' | 'name' | 'avatarUrl'> | null;
  size?: keyof typeof SIZES;
  className?: string;
}

export const MemberAvatar = ({ member, size = 'sm', className }: IMemberAvatarProps) => {
  if (!member) {
    return (
      <span
        className={cn('inline-flex shrink-0 items-center justify-center rounded-full border border-dashed border-ink-faint text-ink-faint', SIZES[size], className)}
        aria-label="Без исполнителя"
      />
    );
  }
  if (member.avatarUrl) {
    return (
      <img
        src={member.avatarUrl}
        alt={member.name}
        className={cn('shrink-0 rounded-full object-cover ring-2 ring-white', SIZES[size], className)}
      />
    );
  }
  const tone = hashOf(member.id) % AVATAR_TINTS.length;
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full font-bold ring-2 ring-white', SIZES[size], className)}
      style={{ background: AVATAR_TINTS[tone], color: AVATAR_INKS[tone] }}
      title={member.name}
    >
      {initialsOf(member.name)}
    </span>
  );
};

interface IAvatarStackProps {
  members: Array<Pick<TeamMember, 'id' | 'name' | 'avatarUrl'>>;
  max?: number;
  size?: keyof typeof SIZES;
}

/** Стопка аватаров с «+N», как в шапке проекта референса. */
export const AvatarStack = ({ members, max = 4, size = 'sm' }: IAvatarStackProps) => {
  const visible = members.slice(0, max);
  const rest = members.length - visible.length;
  return (
    <div className="flex items-center -space-x-2">
      {visible.map((member) => (
        <MemberAvatar key={member.id} member={member} size={size} />
      ))}
      {rest > 0 && (
        <span className={cn('inline-flex items-center justify-center rounded-full bg-ink font-bold text-white ring-2 ring-white', SIZES[size])}>
          +{rest}
        </span>
      )}
    </div>
  );
};
