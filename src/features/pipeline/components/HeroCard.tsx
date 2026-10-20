import { ImagePlus } from 'lucide-react';

import type { PipelineCharacter } from '@/api/models';
import { Button } from '@/components/ui/button';
import { CLIP_FORMS, pluralize } from '@/lib/plural';
import type { TPipelineActions } from '../hooks/usePipelineActions';
import type { IPipelineLookups } from '../hooks/usePipelineData';
import { IMAGE_ACCEPT, isImageFile } from '../lib/mediaFiles';
import { CopyButton } from './CopyButton';
import { DropZone } from './DropZone';
import { Ticks } from './Ticks';

interface IHeroCardProps {
  hero: PipelineCharacter;
  lookups: IPipelineLookups;
  actions: TPipelineActions;
  onOpen: () => void;
}

/** Герой каста: лист персонажа (перетащить — заменить), кто он, где снимаем, его клипы. */
export const HeroCard = ({ hero, lookups, actions, onOpen }: IHeroCardProps) => {
  const cells = lookups.cellsOf(hero.key);
  const done = cells.filter((cell) => cell.status === 'done').length;
  const data = hero.data;

  return (
    <article className="card-surface grid grid-cols-1 gap-4 border-l-4 p-4 md:grid-cols-[160px_1fr] md:p-5 xl:grid-cols-[180px_1fr_260px]" style={{ borderLeftColor: data.color ?? '#9CA3AF' }}>
      <DropZone
        accept={IMAGE_ACCEPT}
        check={isImageFile}
        wrongFile="Лист персонажа — это картинка: jpg, png или webp"
        disabled={actions.busy}
        onFile={(file) => actions.uploadSheet(hero.key, file)}
        className="aspect-square overflow-hidden p-0"
      >
        {hero.sheet ? (
          <img src={hero.sheet} alt={`Лист персонажа: ${hero.name}`} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <>
            <ImagePlus className="h-6 w-6 text-brand-700" />
            Перетащите лист персонажа
          </>
        )}
      </DropZone>

      <div className="min-w-0">
        <h2 className="text-[19px] font-bold tracking-tight text-ink">{hero.name}{data.age ? `, ${data.age}` : ''}</h2>
        <p className="text-[14px] text-ink-muted">{data.profession}{data.business ? `, ${data.business}` : ''}</p>
        <dl className="mt-3 grid grid-cols-[88px_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-[13.5px]">
          {data.look_ru && <><dt className="text-ink-faint">Внешность</dt><dd className="text-ink-soft">{data.look_ru}</dd></>}
          {data.place_ru && <><dt className="text-ink-faint">Место</dt><dd className="text-ink-soft">{data.place_ru}</dd></>}
          {data.personality && <><dt className="text-ink-faint">Характер</dt><dd className="text-ink-soft">{data.personality}</dd></>}
          {data.pains?.length ? (
            <>
              <dt className="text-ink-faint">Боли</dt>
              <dd><ul className="list-disc pl-4 text-ink-soft">{data.pains.map((pain) => <li key={pain}>{pain}</li>)}</ul></dd>
            </>
          ) : null}
        </dl>
      </div>

      <div className="flex flex-col gap-3 md:col-span-2 xl:col-span-1">
        {data.app?.title && (
          <div className="rounded-2xl bg-panel p-3 text-[13px]">
            <b className="block text-ink">{data.app.title}</b>
            <span className="line-clamp-3 text-ink-muted">{data.app.prompt}</span>
          </div>
        )}
        {data.line && <p className="text-[14px] italic text-ink-soft">«{data.line}»</p>}
        <div>
          <Ticks cells={cells} sceneBy={lookups.sceneBy} />
          <div className="mt-1 text-[12.5px] text-ink-faint">{done} из {pluralize(cells.length, CLIP_FORMS)}</div>
        </div>
        <div className="mt-auto flex flex-wrap gap-2">
          <CopyButton text={hero.sheetPrompt} label="Промпт листа" done="Промпт листа скопирован" />
          <Button type="button" size="sm" variant="ghost" onClick={onOpen}>Подробнее</Button>
        </div>
      </div>
    </article>
  );
};
