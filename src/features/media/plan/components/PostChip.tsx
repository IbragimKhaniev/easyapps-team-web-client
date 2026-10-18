import { useDraggable } from '@dnd-kit/core';
import { Lightbulb } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

import type { MediaPost } from '@/api/models';
import { cn } from '@/lib/utils';
import { localTimeOf } from '../../lib/calendar';
import { PLATFORM_META, PLATFORM_ORDER } from '../../lib/platforms';
import { isEditable, POST_STATUS_META, TONE_DOT } from '../../lib/status';

interface IPostChipViewProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  post: MediaPost;
  dragging?: boolean;
  grabbable?: boolean;
}

/** Пост в клетке календаря: время, название, площадки цветными точками, статус — точкой слева. */
export const PostChipView = forwardRef<HTMLButtonElement, IPostChipViewProps>(({ post, dragging, grabbable, className, ...props }, ref) => {
  const tone = POST_STATUS_META[post.status].tone;
  const isIdea = post.status === 'idea';
  const platforms = PLATFORM_ORDER.filter((platform) => post.targets.some((target) => target.platform === platform && target.enabled));
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'group flex w-full items-center gap-1.5 rounded-lg px-1.5 py-1 text-left text-[12px] leading-tight transition-colors',
        isIdea ? 'border border-dashed border-ink-faint/50 text-ink-muted hover:bg-white' : 'bg-white text-ink shadow-card hover:shadow-float',
        dragging && 'opacity-40',
        grabbable && 'cursor-grab active:cursor-grabbing',
        className,
      )}
      title={`${post.title} — ${POST_STATUS_META[post.status].label}`}
      {...props}
    >
      {isIdea ? <Lightbulb className="h-3 w-3 shrink-0 text-amber-500" /> : <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', TONE_DOT[tone])} />}
      {post.publishAt && !isIdea && <span className="shrink-0 font-bold tabular text-ink-soft">{localTimeOf(post.publishAt)}</span>}
      <span className="min-w-0 flex-1 truncate font-semibold">{post.title}</span>
      <span className="flex shrink-0 -space-x-0.5">
        {platforms.map((platform) => (
          <span key={platform} className="h-1.5 w-1.5 rounded-full ring-1 ring-white" style={{ backgroundColor: PLATFORM_META[platform].color }} />
        ))}
      </span>
    </button>
  );
});
PostChipView.displayName = 'PostChipView';

interface IPostChipProps {
  post: MediaPost;
  onOpen: (id: string) => void;
}

/** Пост, который можно перетащить на другой день (если его ещё можно править). */
export const PostChip = ({ post, onOpen }: IPostChipProps) => {
  const canDrag = isEditable(post.status);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: post.id, data: { post }, disabled: !canDrag });
  return (
    <PostChipView
      ref={setNodeRef}
      post={post}
      dragging={isDragging}
      grabbable={canDrag}
      onClick={(event) => {
        event.stopPropagation();
        onOpen(post.id);
      }}
      {...attributes}
      {...listeners}
    />
  );
};
