import { ArrowDownUp, Newspaper, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import type { FeedSort, SocialContentType } from '@/api/models';
import { PATHS } from '@/app/paths';
import { AdaptivePicker } from '@/components/common/AdaptivePicker';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import { MediaSectionTabs } from '../components/MediaSectionTabs';
import { PlatformFilter } from '../components/PlatformFilter';
import { CONTENT_TYPE_LABELS } from '../lib/format';
import { isPlatform } from '../lib/platforms';
import { SocialPostCard } from './components/SocialPostCard';
import { SocialPostSheet } from './components/SocialPostSheet';
import { useFeed } from './hooks/useFeed';

const SORTS: Array<{ value: FeedSort; label: string }> = [
  { value: 'newest', label: 'Сначала новые' },
  { value: 'views', label: 'Больше просмотров' },
  { value: 'engagement', label: 'Выше вовлечённость' },
];

const TYPE_FILTERS: SocialContentType[] = ['text', 'photo', 'video', 'album', 'reel', 'story', 'document'];

const FEED_POST_PARAM = 'item';
const SEARCH_DEBOUNCE_MS = 300;

/**
 * Лента: все посты Telegram, Instagram и VK — и наши из плана, и сделанные
 * руками в приложениях — со счётчиками. Фильтр по площадке и виду, сортировка
 * по просмотрам и вовлечённости.
 */
export const FeedPage = () => {
  const [params, setParams] = useSearchParams();
  const platformParam = params.get('platform');
  const platform = isPlatform(platformParam) ? platformParam : null;
  const sort = (SORTS.find((item) => item.value === params.get('sort'))?.value ?? 'newest') as FeedSort;
  const type = TYPE_FILTERS.find((item) => item === params.get('type')) ?? null;
  const [query, setQuery] = useState(params.get('q') ?? '');
  const debounced = useDebounce(query.trim(), SEARCH_DEBOUNCE_MS);

  const update = (patch: Record<string, string | null>) => setParams((current) => {
    const next = new URLSearchParams(current);
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    return next;
  }, { replace: true });

  useEffect(() => {
    update({ q: debounced || null });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- поиск применяется по паузе в наборе
  }, [debounced]);

  const feed = useFeed({ platform: platform ?? undefined, sort, contentType: type ?? undefined, q: debounced || undefined });
  const items = feed.data?.pages.flatMap((page) => page.data) ?? [];
  const total = feed.data?.pages[0]?.pagination.totalItems ?? 0;

  return (
    <div className="animate-fade-up">
      <PageHeader title="Лента" subtitle={total ? `${total.toLocaleString('ru-RU')} постов на площадках` : undefined}>
        <MediaSectionTabs />
      </PageHeader>
      <div className="flex flex-col gap-4 px-4 lg:px-0">
        <div className="flex flex-wrap items-center gap-2">
          <PlatformFilter value={platform} onChange={(value) => update({ platform: value })} />
          <div className="relative min-w-[200px] flex-1 lg:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по тексту" className="bg-white pl-9 shadow-card" />
          </div>
          <AdaptivePicker
            title="Сортировка"
            options={SORTS}
            selected={sort}
            onSelect={(value) => update({ sort: value === 'newest' ? null : value })}
            align="end"
            trigger={
              <Button variant="white" size="sm">
                <ArrowDownUp /> {SORTS.find((item) => item.value === sort)?.label}
              </Button>
            }
          />
        </div>
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 scrollbar-none lg:mx-0 lg:px-0">
          {[null, ...TYPE_FILTERS].map((item) => (
            <button
              key={item ?? 'all'}
              type="button"
              onClick={() => update({ type: item })}
              className={cn(
                'h-8 shrink-0 rounded-full px-3 text-[13px] font-semibold transition-colors',
                type === item ? 'bg-ink text-white' : 'bg-white text-ink-soft shadow-card hover:text-ink',
              )}
            >
              {item ? CONTENT_TYPE_LABELS[item] : 'Все виды'}
            </button>
          ))}
        </div>

        {feed.isLoading ? (
          <div className="grid gap-3 xl:grid-cols-2">
            {Array.from({ length: 6 }, (_, index) => <div key={index} className="skeleton h-32 rounded-card" />)}
          </div>
        ) : items.length ? (
          <div className="flex flex-col gap-4">
            <div className="grid gap-3 xl:grid-cols-2">
              {items.map((post) => (
                <SocialPostCard key={post.id} post={post} onOpen={(id) => update({ [FEED_POST_PARAM]: id })} />
              ))}
            </div>
            {feed.hasNextPage && (
              <Button variant="white" className="self-center" onClick={() => void feed.fetchNextPage()} disabled={feed.isFetchingNextPage}>
                Показать ещё · {items.length} из {total}
              </Button>
            )}
          </div>
        ) : (
          <div className="card-surface">
            <EmptyState
              icon={Newspaper}
              title="Постов пока нет"
              description="Лента собирается фоновыми задачами: подключите площадки — посты и их статистика появятся после первого обхода."
              action={<Button variant="soft" asChild><Link to={PATHS.media.settings}>Подключить площадки</Link></Button>}
            />
          </div>
        )}
      </div>
      <SocialPostSheet postId={params.get(FEED_POST_PARAM)} onClose={() => update({ [FEED_POST_PARAM]: null })} />
    </div>
  );
};
