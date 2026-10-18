import { CalendarPlus, Lightbulb, Plus } from 'lucide-react';
import { useState } from 'react';

import type { MediaPost } from '@/api/models';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { daysFromToday } from '@/lib/dates';
import { pluralize, POST_FORMS } from '@/lib/plural';
import { dayTitle } from '../../lib/calendar';
import { PlanPostCard } from './PlanPostCard';

interface IDayPanelProps {
  date: string;
  posts: MediaPost[];
  onOpen: (id: string) => void;
  onCreate: (date: string) => void;
  onAddIdea: (date: string, title: string) => Promise<boolean>;
  addingIdea: boolean;
}

const relativeDay = (date: string): string | null => {
  const diff = daysFromToday(date);
  if (diff === 0) return 'Сегодня';
  if (diff === 1) return 'Завтра';
  if (diff === -1) return 'Вчера';
  return null;
};

/** Раскрытый день плана: что выходит, идеи и быстрые «+ пост» и «+ идея». */
export const DayPanel = ({ date, posts, onOpen, onCreate, onAddIdea, addingIdea }: IDayPanelProps) => {
  const [idea, setIdea] = useState('');
  const relative = relativeDay(date);
  const published = posts.filter((post) => post.status === 'published' || post.status === 'partial').length;

  const submitIdea = async () => {
    const title = idea.trim();
    if (!title) return;
    if (await onAddIdea(date, title)) setIdea('');
  };

  return (
    <section className="card-surface flex flex-col gap-4 p-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          {relative && <div className="text-[12px] font-bold uppercase tracking-[0.08em] text-brand-800">{relative}</div>}
          <h2 className="text-[19px] font-bold tracking-tight text-ink">{dayTitle(date)}</h2>
          <p className="mt-0.5 text-[13px] text-ink-muted">
            {posts.length ? `${pluralize(posts.length, POST_FORMS)}${published ? `, вышло ${published}` : ''}` : 'Пока пусто'}
          </p>
        </div>
        <Button size="sm" onClick={() => onCreate(date)}>
          <Plus /> Пост
        </Button>
      </header>

      <form
        className="relative"
        onSubmit={(event) => {
          event.preventDefault();
          void submitIdea();
        }}
      >
        <Lightbulb className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-500" />
        <Input
          value={idea}
          onChange={(event) => setIdea(event.target.value)}
          placeholder="Идея на этот день — Enter"
          className="pl-9"
          disabled={addingIdea}
          maxLength={200}
        />
      </form>

      {posts.length ? (
        <div className="flex flex-col gap-2.5">
          {posts.map((post) => <PlanPostCard key={post.id} post={post} onOpen={onOpen} />)}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onCreate(date)}
          className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-black/[0.08] px-4 py-8 text-center text-[13px] text-ink-muted transition-colors hover:border-brand-300 hover:text-brand-800"
        >
          <CalendarPlus className="h-6 w-6" />
          Соберите пост на этот день — текст, фото, видео для Telegram, Instagram и VK
        </button>
      )}
    </section>
  );
};
