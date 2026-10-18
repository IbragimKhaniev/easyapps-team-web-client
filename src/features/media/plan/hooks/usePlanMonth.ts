import { useMemo } from 'react';

import { useListMediaPosts } from '@/api/generated/media-posts/media-posts';
import type { MediaPost, SocialPlatform } from '@/api/models';
import { monthWeeks, type ICalendarDay, type TMonthKey } from '../../lib/calendar';

/** План перечитывается сам: фоновая публикация меняет статусы, пока экран открыт. */
const PLAN_REFRESH_MS = 30_000;

/** Внутри дня: сначала по времени выхода, идеи и посты без времени — в конце. */
const byTime = (a: MediaPost, b: MediaPost): number =>
  (a.publishAt ?? '9999').localeCompare(b.publishAt ?? '9999') || a.createdAt.localeCompare(b.createdAt);

/**
 * Посты видимой сетки месяца (с краями соседних месяцев), разложенные по
 * дням плана.
 */
export const usePlanMonth = (month: TMonthKey, platform: SocialPlatform | null) => {
  const weeks = useMemo(() => monthWeeks(month), [month]);
  const from = weeks[0][0].iso;
  const to = weeks[weeks.length - 1][6].iso;

  const { data, isLoading } = useListMediaPosts(
    { from, to, platform: platform ?? undefined },
    { query: { refetchInterval: PLAN_REFRESH_MS, placeholderData: (previous) => previous } },
  );

  const byDay = useMemo(() => {
    const map = new Map<string, MediaPost[]>();
    for (const post of data?.data ?? []) map.set(post.plannedDate, [...(map.get(post.plannedDate) ?? []), post]);
    for (const list of map.values()) list.sort(byTime);
    return map;
  }, [data]);

  return { weeks, byDay, isLoading, postsOf: (day: ICalendarDay | string) => byDay.get(typeof day === 'string' ? day : day.iso) ?? [] };
};
