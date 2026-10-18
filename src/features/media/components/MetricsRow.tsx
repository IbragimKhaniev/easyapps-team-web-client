import { Bookmark, Eye, Heart, MessageCircle, Repeat2, SmilePlus, Users } from 'lucide-react';

import type { SocialMetrics, SocialPlatform } from '@/api/models';
import { cn } from '@/lib/utils';
import { formatCompact } from '../lib/format';

interface IMetricsRowProps {
  metrics: SocialMetrics;
  platform: SocialPlatform;
  className?: string;
}

/** Счётчики поста — только те, что площадка считает (у Telegram реакции вместо лайков). */
export const MetricsRow = ({ metrics, platform, className }: IMetricsRowProps) => {
  const items = [
    { key: 'views', icon: Eye, value: metrics.views, title: 'Просмотры' },
    { key: 'reach', icon: Users, value: metrics.reach, title: 'Охват' },
    platform === 'telegram'
      ? { key: 'reactions', icon: SmilePlus, value: metrics.reactions, title: 'Реакции' }
      : { key: 'likes', icon: Heart, value: metrics.likes, title: 'Лайки' },
    { key: 'comments', icon: MessageCircle, value: metrics.comments, title: 'Комментарии' },
    { key: 'shares', icon: Repeat2, value: metrics.shares, title: platform === 'telegram' ? 'Пересылки' : 'Репосты' },
    { key: 'saves', icon: Bookmark, value: metrics.saves, title: 'Сохранения' },
  ].filter((item) => item.value !== null && item.value !== undefined);

  if (!items.length) return <span className={cn('text-[12.5px] text-ink-faint', className)}>Метрики появятся после сбора</span>;

  return (
    <span className={cn('flex flex-wrap items-center gap-x-3 gap-y-1', className)}>
      {items.map((item) => (
        <span key={item.key} className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-ink-soft tabular" title={item.title}>
          <item.icon className="h-3.5 w-3.5 text-ink-faint" /> {formatCompact(item.value)}
        </span>
      ))}
    </span>
  );
};
