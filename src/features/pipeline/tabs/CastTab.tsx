import type { PipelineState } from '@/api/models';
import { HeroCard } from '../components/HeroCard';
import type { TPipelineActions } from '../hooks/usePipelineActions';
import type { IPipelineLookups } from '../hooks/usePipelineData';

interface ICastTabProps {
  state: PipelineState;
  lookups: IPipelineLookups;
  actions: TPipelineActions;
  onOpenHero: (key: string) => void;
}

/** Каст: постоянные герои — лица всех роликов, потом массовка. */
export const CastTab = ({ state, lookups, actions, onOpenHero }: ICastTabProps) => {
  const main = state.characters.filter((hero) => hero.isMain);
  const extras = state.characters.filter((hero) => !hero.isMain);
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[14px] text-ink-muted">
        Сначала для каждого героя делается лист персонажа: он идёт референсом во все его клипы, чтобы лицо и одежда не менялись.
        Перетащите готовый лист на карточку.
      </p>
      {main.map((hero) => <HeroCard key={hero.key} hero={hero} lookups={lookups} actions={actions} onOpen={() => onOpenHero(hero.key)} />)}
      {extras.length > 0 && (
        <>
          <h2 className="pt-3 text-[13px] font-bold uppercase tracking-[0.08em] text-ink-faint">Массовка и родные</h2>
          {extras.map((hero) => <HeroCard key={hero.key} hero={hero} lookups={lookups} actions={actions} onOpen={() => onOpenHero(hero.key)} />)}
        </>
      )}
    </div>
  );
};
