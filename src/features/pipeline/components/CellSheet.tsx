import { Film, ImageIcon, Save } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { PipelineCellStatus, UpdatePipelineCellInputStatus } from '@/api/models';
import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { TPipelineActions } from '../hooks/usePipelineActions';
import type { IPipelineLookups } from '../hooks/usePipelineData';
import { CELL_MANUAL_STATUSES, CELL_STATUS_META } from '../lib/pipelineMeta';
import { CopyButton } from './CopyButton';
import { IMAGE_ACCEPT, isImageFile, isVideoFile, VIDEO_ACCEPT } from '../lib/mediaFiles';
import { DropZone } from './DropZone';

interface ICellSheetProps {
  cellKey: string | null;
  lookups: IPipelineLookups;
  spec: Record<string, unknown>;
  actions: TPipelineActions;
  onClose: () => void;
}

const specText = (spec: Record<string, unknown>, key: string, fallback: string): string =>
  (typeof spec[key] === 'string' || typeof spec[key] === 'number' ? String(spec[key]) : fallback);

/**
 * Клетка библиотеки «герой × сцена»: лист героя референсом, промпты кадра и
 * движения (из шаблона сцены и внешности героя), файлы, статус, заметка и
 * номера генераций Higgsfield.
 */
export const CellSheet = ({ cellKey, lookups, spec, actions, onClose }: ICellSheetProps) => {
  const cell = cellKey ? lookups.cellBy.get(cellKey) : undefined;
  const hero = cell ? lookups.heroBy.get(cell.character) : undefined;
  const scene = cell ? lookups.sceneBy.get(cell.scene) : undefined;
  const [note, setNote] = useState('');

  useEffect(() => {
    setNote(cell?.note ?? '');
  }, [cell?.key, cell?.note]);

  const higgsfield = Object.entries(cell?.higgsfield ?? {});

  return (
    <ResponsiveDialog
      open={Boolean(cell)}
      onOpenChange={(open) => !open && onClose()}
      title={cell ? `${hero?.name ?? cell.character}: ${scene?.title ?? cell.scene}` : 'Клетка'}
      showTitle
      desktopClassName="max-h-[min(92vh,900px)] max-w-[720px] overflow-y-auto"
      mobileClassName="h-[92dvh]"
    >
      {cell && (
        <div className="flex flex-col gap-5 overflow-y-auto px-5 pb-6 pt-2 lg:px-6">
          {scene?.data.ru && <p className="-mt-1 text-[14px] text-ink-muted">{scene.data.ru}</p>}

          <div className="flex flex-wrap items-center gap-2">
            {cell.status === 'done' && (
              <span className={cn('rounded-full px-3 py-1 text-[13px] font-bold', CELL_STATUS_META.done.pill)}>Готов — клип загружен</span>
            )}
            {CELL_MANUAL_STATUSES.map((status: UpdatePipelineCellInputStatus) => (
              <button
                key={status}
                type="button"
                disabled={actions.busy}
                onClick={() => actions.setCellStatus(cell.key, status, CELL_STATUS_META[status as PipelineCellStatus].label.toLowerCase())}
                className={cn(
                  'h-8 rounded-full px-3 text-[13px] font-bold transition',
                  cell.status === status ? 'bg-ink text-white' : 'bg-secondary text-ink-soft hover:bg-ink/[0.08]',
                )}
              >
                {CELL_STATUS_META[status as PipelineCellStatus].label}
              </button>
            ))}
          </div>
          {cell.status === 'done' && (
            <p className="-mt-3 text-[13px] text-ink-muted">
              {cell.sharedFrom ? `Общий клип с ${cell.sharedFrom}. ` : ''}
              {cell.usedIn.length ? `Уже стоит в роликах: ${cell.usedIn.join(', ')} — можно брать и в новые.` : 'Ещё ни в одном ролике — готовая часть для следующего.'}
            </p>
          )}

          <div className="flex items-center gap-3 rounded-2xl bg-panel p-3">
            {hero?.sheet ? (
              <>
                <img src={hero.sheet} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                <span className="text-[13px] text-ink-soft">Лист персонажа — референсом к кадру: лицо и одежда совпадут с остальными клипами героя.</span>
              </>
            ) : (
              <span className="text-[13px] text-ink-soft">Листа персонажа пока нет — сначала его делают в «Касте», иначе лицо будет меняться от клипа к клипу.</span>
            )}
          </div>

          <section className="flex flex-col gap-2">
            <header className="flex items-baseline justify-between gap-3">
              <b className="text-[15px] text-ink">1. Кадр</b>
              <span className="text-[12px] text-ink-faint">{specText(spec, 'image_model', 'Nano Banana 2')}, {specText(spec, 'aspect', '9:16')}</span>
            </header>
            <p className="whitespace-pre-wrap rounded-2xl bg-secondary p-3 font-mono text-[12.5px] leading-relaxed text-ink-soft">{cell.prompts.image}</p>
            <div><CopyButton text={cell.prompts.image} label="Промпт кадра" done="Промпт кадра скопирован" /></div>
          </section>

          <section className="flex flex-col gap-2">
            <header className="flex items-baseline justify-between gap-3">
              <b className="text-[15px] text-ink">2. Движение</b>
              <span className="text-[12px] text-ink-faint">{specText(spec, 'video_model', 'Kling 3.0')}, {specText(spec, 'seconds', '5')} с, без звука</span>
            </header>
            <p className="whitespace-pre-wrap rounded-2xl bg-secondary p-3 font-mono text-[12.5px] leading-relaxed text-ink-soft">{cell.prompts.motion}</p>
            <div><CopyButton text={cell.prompts.motion} label="Промпт движения" done="Промпт движения скопирован" /></div>
          </section>

          <section className="flex flex-col gap-2">
            <b className="text-[15px] text-ink">3. Файлы</b>
            <div className="grid grid-cols-2 gap-2">
              <DropZone accept={IMAGE_ACCEPT} check={isImageFile} wrongFile="Сюда нужен кадр: jpg, png или webp" disabled={actions.busy} onFile={(file) => actions.uploadFrame(cell.key, file)}>
                <ImageIcon className="h-5 w-5 text-brand-700" />
                <b className="text-ink">Кадр</b>
                {cell.frame ? 'загружен, можно заменить' : 'jpg или png'}
              </DropZone>
              <DropZone accept={VIDEO_ACCEPT} check={isVideoFile} wrongFile="Сюда нужен клип: mp4 или mov" disabled={actions.busy} onFile={(file) => actions.uploadClip(cell.key, file)}>
                <Film className="h-5 w-5 text-brand-700" />
                <b className="text-ink">Клип</b>
                {cell.clip ? 'загружен, можно заменить' : 'mp4 или mov'}
              </DropZone>
            </div>
            {(cell.frame || cell.clip) && (
              <div className="grid grid-cols-2 gap-2">
                {cell.frame ? <img src={cell.frame} alt="Кадр" className="aspect-[9/16] w-full rounded-2xl object-cover" /> : <div />}
                {cell.clip && <video src={cell.clip} controls muted loop playsInline preload="metadata" className="aspect-[9/16] w-full rounded-2xl bg-black object-cover" />}
              </div>
            )}
          </section>

          {higgsfield.length > 0 && (
            <section className="flex flex-col gap-1.5">
              <b className="text-[15px] text-ink">Генерации Higgsfield</b>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[12.5px]">
                {higgsfield.map(([key, value]) => (
                  <div key={key} className="contents">
                    <dt className="text-ink-faint">{key}</dt>
                    <dd className="truncate font-mono text-ink-soft">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <section className="flex flex-col gap-2">
            <b className="text-[15px] text-ink">Заметка</b>
            <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Например: руки получились странные, переснять" rows={3} />
            <div>
              <Button type="button" size="sm" disabled={actions.busy || note === (cell.note ?? '')} onClick={() => actions.saveCellNote(cell.key, note)}>
                <Save /> Сохранить заметку
              </Button>
            </div>
          </section>
        </div>
      )}
    </ResponsiveDialog>
  );
};
