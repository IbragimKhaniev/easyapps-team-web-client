import { Pencil, Save, X } from 'lucide-react';
import { useState } from 'react';

import type { PipelineCharacter, UpdatePipelineCharacterInput } from '@/api/models';
import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { TPipelineActions } from '../hooks/usePipelineActions';
import type { IPipelineLookups } from '../hooks/usePipelineData';
import { IMAGE_ACCEPT, isImageFile } from '../lib/mediaFiles';
import { CopyButton } from './CopyButton';
import { DropZone } from './DropZone';
import { Ticks } from './Ticks';
import { VideoCard } from './VideoCard';

interface IHeroSheetProps {
  heroKey: string | null;
  lookups: IPipelineLookups;
  actions: TPipelineActions;
  onClose: () => void;
  onOpenVideo: (number: string) => void;
}

type TTextField = Exclude<keyof UpdatePipelineCharacterInput, 'age' | 'pains'>;

/** Поля, которые правят на сайте; look и place — английские, из них собираются промпты. */
const TEXT_FIELDS: Array<{ key: TTextField; label: string; long?: boolean }> = [
  { key: 'name', label: 'Имя' },
  { key: 'profession', label: 'Профессия' },
  { key: 'business', label: 'Дело' },
  { key: 'look_ru', label: 'Внешность', long: true },
  { key: 'place_ru', label: 'Место', long: true },
  { key: 'look', label: 'Внешность для промптов (англ.)', long: true },
  { key: 'place', label: 'Место для промптов (англ.)', long: true },
  { key: 'work', label: 'Работа в кадре (англ.)' },
  { key: 'personality', label: 'Характер', long: true },
  { key: 'line', label: 'Фраза героя' },
];

type TDraft = Record<TTextField, string> & { pains: string };

const draftOf = (hero: PipelineCharacter): TDraft => ({
  ...Object.fromEntries(TEXT_FIELDS.map((field) => [field.key, String(hero.data[field.key] ?? '')])) as Record<TTextField, string>,
  pains: (hero.data.pains ?? []).join('\n'),
});

/** Правка: с чего начали и что сейчас. Уходит только тронутое — правки агента в других полях не затираются. */
interface IEditing {
  base: TDraft;
  values: TDraft;
}

const linesOf = (text: string): string[] => text.split('\n').map((line) => line.trim()).filter(Boolean);

/** Герой целиком: лист, промпт листа, внешность и место для промптов, правка, его ролики. */
export const HeroSheet = ({ heroKey, lookups, actions, onClose, onOpenVideo }: IHeroSheetProps) => {
  const hero = heroKey ? lookups.heroBy.get(heroKey) : undefined;
  const [editing, setEditing] = useState<IEditing | null>(null);
  const [editingKey, setEditingKey] = useState(heroKey);
  if (editingKey !== heroKey) {
    setEditingKey(heroKey);
    setEditing(null);
  }

  const videos = hero ? [...lookups.videoBy.values()].filter((video) => video.hero === hero.key) : [];

  const setValue = (field: keyof TDraft, value: string) => editing && setEditing({ ...editing, values: { ...editing.values, [field]: value } });

  const save = async () => {
    if (!hero || !editing) return;
    const { base, values } = editing;
    const patch: UpdatePipelineCharacterInput = {};
    for (const field of TEXT_FIELDS) {
      if (values[field.key] !== base[field.key]) patch[field.key] = values[field.key].trim();
    }
    if (linesOf(values.pains).join('\n') !== linesOf(base.pains).join('\n')) patch.pains = linesOf(values.pains);
    if (!Object.keys(patch).length) {
      setEditing(null);
      return;
    }
    if (await actions.updateCharacter(hero.key, patch)) setEditing(null);
  };

  return (
    <ResponsiveDialog
      open={Boolean(hero)}
      onOpenChange={(open) => !open && onClose()}
      title={hero ? `${hero.name}${hero.data.age ? `, ${hero.data.age}` : ''}` : 'Герой'}
      showTitle
      desktopClassName="max-h-[min(92vh,900px)] max-w-[720px] overflow-y-auto"
      mobileClassName="h-[92dvh]"
    >
      {hero && (
        <div className="flex flex-col gap-5 overflow-y-auto px-5 pb-6 pt-2 lg:px-6">
          <p className="-mt-1 text-[14px] text-ink-muted">{hero.data.profession}{hero.data.business ? `, ${hero.data.business}` : ''}</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[200px_1fr]">
            <DropZone accept={IMAGE_ACCEPT} check={isImageFile} wrongFile="Лист персонажа — это картинка: jpg, png или webp" disabled={actions.busy} onFile={(file) => actions.uploadSheet(hero.key, file)} className="aspect-square overflow-hidden p-0">
              {hero.sheet ? <img src={hero.sheet} alt="" className="h-full w-full object-cover" /> : 'Перетащите лист персонажа'}
            </DropZone>
            <div className="flex flex-col gap-2">
              <b className="text-[15px] text-ink">Промпт листа персонажа</b>
              <p className="rounded-2xl bg-secondary p-3 font-mono text-[12.5px] leading-relaxed text-ink-soft">{hero.sheetPrompt}</p>
              <div><CopyButton text={hero.sheetPrompt} label="Промпт листа" done="Промпт листа скопирован" /></div>
              {hero.data.sheet_job && <p className="text-[12px] text-ink-faint">Лист в Higgsfield: <span className="font-mono">{hero.data.sheet_job}</span></p>}
            </div>
          </div>

          {editing ? (
            <section className="flex flex-col gap-3">
              {TEXT_FIELDS.map((field) => (
                <label key={field.key} className="flex flex-col gap-1">
                  <span className="text-[12.5px] font-semibold text-ink-muted">{field.label}</span>
                  {field.long ? (
                    <Textarea rows={3} value={editing.values[field.key]} onChange={(event) => setValue(field.key, event.target.value)} />
                  ) : (
                    <Input value={editing.values[field.key]} onChange={(event) => setValue(field.key, event.target.value)} />
                  )}
                </label>
              ))}
              <label className="flex flex-col gap-1">
                <span className="text-[12.5px] font-semibold text-ink-muted">Боли — по одной в строке</span>
                <Textarea rows={4} value={editing.values.pains} onChange={(event) => setValue('pains', event.target.value)} />
              </label>
              <div className="flex gap-2">
                <Button type="button" disabled={actions.busy} onClick={save}><Save /> Сохранить</Button>
                <Button type="button" variant="ghost" onClick={() => setEditing(null)}><X /> Отмена</Button>
              </div>
            </section>
          ) : (
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <b className="text-[15px] text-ink">Для промптов</b>
                <Button type="button" size="sm" variant="outline" onClick={() => setEditing({ base: draftOf(hero), values: draftOf(hero) })}><Pencil /> Править героя</Button>
              </div>
              <div>
                <span className="text-[12.5px] font-semibold text-ink-muted">Как выглядит</span>
                <p className="rounded-2xl bg-secondary p-3 font-mono text-[12.5px] leading-relaxed text-ink-soft">{hero.data.look}</p>
              </div>
              <div>
                <span className="text-[12.5px] font-semibold text-ink-muted">Где снимаем</span>
                <p className="rounded-2xl bg-secondary p-3 font-mono text-[12.5px] leading-relaxed text-ink-soft">{hero.data.place}</p>
              </div>
              <p className="text-[12.5px] text-ink-faint">Поправили внешность или место — поменялись промпты всей строки героя в библиотеке.</p>
            </section>
          )}

          <section className="flex flex-col gap-2">
            <b className="text-[15px] text-ink">Клипы</b>
            <Ticks cells={lookups.cellsOf(hero.key)} sceneBy={lookups.sceneBy} />
          </section>

          <section className="flex flex-col gap-2">
            <b className="text-[15px] text-ink">Ролики с героем</b>
            {videos.length
              ? videos.map((video) => <VideoCard key={video.number} video={video} lookups={lookups} onOpen={() => onOpenVideo(video.number)} />)
              : <p className="text-[13px] text-ink-faint">Пока нет.</p>}
          </section>
        </div>
      )}
    </ResponsiveDialog>
  );
};
