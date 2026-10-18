import { useQueryClient } from '@tanstack/react-query';
import { ArrowUp, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import {
  getListTaskCommentsQueryKey,
  useCreateTaskComment,
  useDeleteComment,
  useListTaskComments,
} from '@/api/generated/comments/comments';
import { Markdown } from '@/components/common/Markdown';
import { MemberAvatar } from '@/components/common/MemberAvatar';
import { useAutosizeTextarea } from '@/hooks/useAutosizeTextarea';
import { useMembers } from '@/hooks/useDirectory';
import { useSession } from '@/hooks/useSession';
import { timeAgo } from '@/lib/dates';
import { apiErrorMessage } from '@/lib/errors';
import { refreshTaskViews } from '../../lib/cache';

/** Комментарии: лента и поле ввода (⌘Enter — отправить). Удалить — автор или админ. */
export const TaskComments = ({ taskKey }: { taskKey: string }) => {
  const queryClient = useQueryClient();
  const { data } = useListTaskComments(taskKey);
  const { map: members } = useMembers();
  const { user, isAdmin } = useSession();
  const createComment = useCreateTaskComment();
  const deleteComment = useDeleteComment();
  const [draft, setDraft] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);
  useAutosizeTextarea(ref, draft);

  const comments = data?.data ?? [];

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: getListTaskCommentsQueryKey(taskKey) });
    refreshTaskViews(queryClient, taskKey);
  };

  const send = async () => {
    const body = draft.trim();
    if (!body) return;
    try {
      await createComment.mutateAsync({ key: taskKey, data: { body } });
      setDraft('');
      refresh();
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Комментарий не отправлен'));
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteComment.mutateAsync({ id });
      refresh();
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Не удалось удалить комментарий'));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {comments.length === 0 && <p className="text-[14px] text-ink-faint">Комментариев пока нет</p>}
      {comments.map((comment) => {
        const author = members.get(comment.authorId);
        const canDelete = comment.authorId === user?.id || isAdmin;
        return (
          <article key={comment.id} className="group flex gap-3">
            <MemberAvatar member={author} size="sm" />
            <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md bg-secondary px-3.5 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[13.5px] font-bold text-ink">{author?.name ?? 'Участник'}</span>
                <span className="text-[12px] text-ink-faint">{timeAgo(comment.createdAt)}</span>
                {comment.editedAt && <span className="text-[12px] text-ink-faint">· изменён</span>}
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => void remove(comment.id)}
                    className="ml-auto text-ink-faint opacity-100 transition-opacity hover:text-rose-500 md:opacity-0 md:group-hover:opacity-100"
                    aria-label="Удалить комментарий"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Markdown className="mt-1 text-[14px]">{comment.body}</Markdown>
            </div>
          </article>
        );
      })}

      <form
        className="flex items-end gap-2 rounded-[22px] border border-black/[0.07] bg-white p-1.5 pl-4 shadow-card focus-within:border-brand/40"
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
      >
        <textarea
          ref={ref}
          value={draft}
          rows={1}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              void send();
            }
          }}
          placeholder="Написать комментарий…"
          maxLength={10_000}
          className="max-h-48 flex-1 resize-none bg-transparent py-2 text-[15px] text-ink outline-none placeholder:text-ink-faint"
        />
        <button
          type="submit"
          disabled={!draft.trim() || createComment.isPending}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-opacity disabled:opacity-30"
          aria-label="Отправить"
        >
          <ArrowUp className="h-5 w-5" strokeWidth={2.6} />
        </button>
      </form>
    </div>
  );
};
