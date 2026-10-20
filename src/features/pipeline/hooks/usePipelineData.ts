import { useMemo } from 'react';

import { useGetPipelineState } from '@/api/generated/pipeline/pipeline';
import {
  PipelineCellStatus,
  type PipelineCell,
  type PipelineCharacter,
  type PipelineFormat,
  type PipelineScene,
  type PipelineState,
  type PipelineVideo,
} from '@/api/models';
import { SCENE_GROUP_ORDER, SCENE_GROUP_TITLES } from '../lib/pipelineMeta';

/** Агент работает, пока люди смотрят: состояние перечитываем раз в 20 с. */
const STATE_REFRESH_MS = 20_000;

/** Доска библиотеки: герои одной группы × её сцены. */
export interface IPipelineBoard {
  group: string;
  title: string;
  heroes: PipelineCharacter[];
  scenes: PipelineScene[];
}

export interface IPipelineLookups {
  heroBy: Map<string, PipelineCharacter>;
  sceneBy: Map<string, PipelineScene>;
  formatBy: Map<string, PipelineFormat>;
  cellBy: Map<string, PipelineCell>;
  videoBy: Map<string, PipelineVideo>;
  /** Клетки героя в порядке сцен. */
  cellsOf: (heroKey: string) => PipelineCell[];
  boards: IPipelineBoard[];
  cellCounts: Record<PipelineCellStatus, number>;
}

const buildLookups = (state: PipelineState): IPipelineLookups => {
  const heroBy = new Map(state.characters.map((hero) => [hero.key, hero]));
  const sceneBy = new Map(state.scenes.map((scene) => [scene.key, scene]));
  const formatBy = new Map(state.formats.filter((format) => format.id).map((format) => [format.id!, format]));
  const cellBy = new Map(state.cells.map((cell) => [cell.key, cell]));
  const videoBy = new Map(state.videos.map((video) => [video.number, video]));
  const byHero = new Map<string, PipelineCell[]>();
  for (const cell of state.cells) byHero.set(cell.character, [...(byHero.get(cell.character) ?? []), cell]);

  const groups = [...new Set(state.characters.map((hero) => hero.sceneGroup))]
    .sort((a, b) => {
      const rank = (group: string) => (SCENE_GROUP_ORDER.includes(group) ? SCENE_GROUP_ORDER.indexOf(group) : SCENE_GROUP_ORDER.length);
      return rank(a) - rank(b);
    });
  const boards = groups
    .map((group) => ({
      group,
      title: SCENE_GROUP_TITLES[group] ?? heroBy.get(group)?.name ?? group,
      heroes: state.characters.filter((hero) => hero.sceneGroup === group),
      scenes: state.scenes.filter((scene) => scene.who === group),
    }))
    .filter((board) => board.heroes.length && board.scenes.length);

  const cellCounts = Object.fromEntries(Object.values(PipelineCellStatus).map((status) => [status, 0])) as Record<PipelineCellStatus, number>;
  for (const cell of state.cells) cellCounts[cell.status] += 1;

  return { heroBy, sceneBy, formatBy, cellBy, videoBy, cellsOf: (heroKey) => byHero.get(heroKey) ?? [], boards, cellCounts };
};

/** Состояние конвейера для дашборда и справочники по нему. */
export const usePipelineData = (project: string) => {
  const query = useGetPipelineState(project, {
    query: { enabled: Boolean(project), refetchInterval: STATE_REFRESH_MS, placeholderData: (previous) => previous },
  });
  const state = query.data?.data;
  const lookups = useMemo(() => (state ? buildLookups(state) : null), [state]);
  return { state, lookups, isLoading: query.isLoading, error: query.error };
};
