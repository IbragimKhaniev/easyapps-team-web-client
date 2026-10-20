import { Copy, MoreHorizontal, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { MediaAsset, MediaPost, MediaPostDetail } from '@/api/models';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import { PostStatusPill } from '../components/StatusPill';
import { useIntegrationsState } from '../hooks/useIntegrationsState';
import { isEditable } from '../lib/status';
import { ComposerActions } from './components/ComposerActions';
import { ContentEditor, type TContentTab } from './components/ContentEditor';
import { IssuesList } from './components/IssuesList';
import { PlatformToggles } from './components/PlatformToggles';
import { PostPreview } from './components/previews/PostPreview';
import { SchedulePicker } from './components/SchedulePicker';
import { TargetStatusList } from './components/TargetStatusList';
import { useComposerDraft } from './hooks/useComposerDraft';
import { usePostActions } from './hooks/usePostActions';
import { draftFromPost, enabledPlatforms } from './model';

interface IPostComposerProps {
  post: MediaPostDetail | null;
  newDate: string;
  /** Новый пост сразу с этим файлом и его названием (ролик из конвейера). */
  initialAsset?: MediaAsset | null;
  onClose: () => void;
  /** Новый пост сохранился — адрес переходит на его id. */
  onCreated: (post: MediaPost, assets: MediaPostDetail['media']) => void;
}

type TMobilePane = 'edit' | 'preview';

const Section = ({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) => (
  <section className={cn('flex flex-col gap-2.5', className)}>
    {title && <h3 className="text-[12px] font-bold uppercase tracking-[0.08em] text-ink-faint">{title}</h3>}
    {children}
  </section>
);

/**
 * Конструктор поста: что (текст и файлы, свои для площадки), куда (площадки
 * и их настройки), когда (день плана и время) — и как это будет выглядеть.
 * Компьютер — два столбца: редактор и живой предпросмотр; телефон — шторка
 * с переключателем «Пост / Как увидят».
 */
export const PostComposer = ({ post, newDate, initialAsset, onClose, onCreated }: IPostComposerProps) => {
  const isDesktop = useIsDesktop();
  const { connected, accountOf } = useIntegrationsState();
  const api = useComposerDraft({ post, newDate, connected, initialAsset });
  const actions = usePostActions();
  const [tab, setTab] = useState<TContentTab>('common');
  const [pane, setPane] = useState<TMobilePane>('edit');
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { draft, dirty } = api;
  const status = post?.status ?? null;
  const editable = status === null || isEditable(status);
  const platforms = enabledPlatforms(draft);
  const issues = actions.blockingIssues ?? post?.issues ?? [];

  /** Пост с сервера после действия — новый исходник черновика (и новый адрес, если пост только что создан). */
  const settle = (saved: MediaPost | null | undefined) => {
    if (!saved) return;
    api.resetTo(draftFromPost(saved));
    if (!post) onCreated(saved, [...api.assets.values()].filter((asset) => saved.mediaIds.includes(asset.id)));
  };

  const save = async () => settle(await actions.save(post?.id ?? null, draft, dirty));
  const saveIdea = async () => settle(await actions.save(null, draft, true, true));
  const schedule = async () => settle(await actions.schedulePost(post?.id ?? null, draft, dirty));
  const publishNow = async () => settle(await actions.publishPost(post?.id ?? null, draft, dirty));
  const unschedule = async () => post && settle(await actions.unschedulePost(post.id));

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault();
        void save();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const requestClose = () => (dirty ? setConfirmClose(true) : onClose());

  const header = (
    <div className="flex items-center gap-3 border-b border-black/[0.06] px-5 py-3 lg:px-6">
      <Input
        value={draft.title}
        onChange={(event) => api.setField('title', event.target.value)}
        placeholder="Название в плане: «Кейс driving-book»"
        className="h-11 flex-1 bg-transparent px-0 text-[20px] font-bold tracking-tight focus-visible:bg-transparent focus-visible:ring-0"
        aria-label="Название поста"
      />
      {status && <PostStatusPill status={status} />}
      {post && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Ещё">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => void actions.duplicatePost(post.id)}>
              <Copy /> Копия поста
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-rose-600" disabled={status === 'publishing'} onSelect={() => setConfirmDelete(true)}>
              <Trash2 /> Убрать из плана
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <Button variant="ghost" size="icon" onClick={requestClose} aria-label="Закрыть">
        <X />
      </Button>
    </div>
  );

  const editor = (
    <div className="flex flex-col gap-6">
      <Section title="Когда">
        <div className="flex flex-wrap items-center gap-2">
          <SchedulePicker
            date={draft.plannedDate}
            time={draft.time}
            disabled={!editable}
            onDate={(date) => api.setField('plannedDate', date)}
            onTime={(time) => api.setField('time', time)}
          />
          <Input
            value={draft.rubric}
            onChange={(event) => api.setField('rubric', event.target.value)}
            placeholder="Рубрика"
            className="h-11 w-[160px]"
            maxLength={40}
          />
        </div>
      </Section>

      <Section title="Где">
        <PlatformToggles
          enabled={{ telegram: draft.targets.telegram.enabled, instagram: draft.targets.instagram.enabled, vk: draft.targets.vk.enabled }}
          connected={connected}
          disabled={!editable}
          onToggle={(platform) => api.patchTarget(platform, { enabled: !draft.targets[platform].enabled })}
        />
      </Section>

      <Section title="Что">
        <ContentEditor api={api} tab={tab} onTab={setTab} disabled={!editable} />
      </Section>

      {post && status !== 'draft' && status !== 'idea' && (
        <Section title="Публикация">
          <TargetStatusList targets={post.targets} busy={actions.busy !== null} onRetry={(platform) => void actions.retryTarget(post.id, platform).then(settle)} />
        </Section>
      )}

      <Section title="Заметки команды">
        <Textarea
          value={draft.notes}
          onChange={(event) => api.setField('notes', event.target.value)}
          placeholder="Не публикуются: идеи, ссылки на исходники, кто согласует"
          rows={3}
        />
      </Section>
    </div>
  );

  const preview = (
    <PostPreview
      draft={draft}
      platforms={platforms}
      assets={api.assets}
      accountOf={accountOf}
      focusPlatform={tab === 'common' ? null : tab}
    />
  );

  const footer = (
    <div className="flex flex-col gap-2 border-t border-black/[0.06] bg-white px-5 py-3 lg:px-6">
      {issues.length > 0 && <IssuesList issues={issues} className="max-h-32 overflow-y-auto" />}
      <ComposerActions
        status={status}
        editable={editable}
        dirty={dirty}
        busy={actions.busy}
        date={draft.plannedDate}
        time={draft.time}
        canPublish={platforms.length > 0}
        compact={!isDesktop}
        onSave={() => void save()}
        onSaveIdea={post ? undefined : () => void saveIdea()}
        onSchedule={() => void schedule()}
        onUnschedule={() => void unschedule()}
        onPublishNow={() => void publishNow()}
      />
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      {header}
      {isDesktop ? (
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_420px]">
          <div className="min-h-0 overflow-y-auto px-6 py-5">{editor}</div>
          <aside className="min-h-0 overflow-y-auto border-l border-black/[0.06] bg-panel px-6 py-5">
            <div className="mb-3 text-[12px] font-bold uppercase tracking-[0.08em] text-ink-faint">Как увидят подписчики</div>
            {preview}
          </aside>
        </div>
      ) : (
        <>
          <div className="px-5 pt-3">
            <SegmentedControl
              segments={[{ value: 'edit', label: 'Пост' }, { value: 'preview', label: 'Как увидят' }]}
              value={pane}
              onChange={setPane}
              className="w-full"
            />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{pane === 'edit' ? editor : preview}</div>
        </>
      )}
      {footer}

      <AlertDialog open={confirmClose} onOpenChange={setConfirmClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Закрыть без сохранения?</AlertDialogTitle>
            <AlertDialogDescription>Изменения в посте пропадут.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Остаться</AlertDialogCancel>
            <AlertDialogAction onClick={onClose}>Закрыть</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Убрать пост из плана?</AlertDialogTitle>
            <AlertDialogDescription>Уже вышедшие публикации на площадках останутся — удалить их можно только в самих приложениях.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => post && void actions.removePost(post.id).then((removed) => removed && onClose())}
            >
              Убрать
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
