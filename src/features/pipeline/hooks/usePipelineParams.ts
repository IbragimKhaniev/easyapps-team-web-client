import { useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { PipelineCellStatus } from '@/api/models';
import { PIPELINE_CELL_PARAM, PIPELINE_HERO_PARAM, PIPELINE_TABS, PIPELINE_VIDEO_PARAM, TPipelineTab } from '@/app/paths';

const FILTER_PARAM = 'status';

const isTab = (value: string | undefined): value is TPipelineTab => Boolean(value) && (PIPELINE_TABS as readonly string[]).includes(value!);
const isCellStatus = (value: string | null): value is PipelineCellStatus =>
  Boolean(value) && (Object.values(PipelineCellStatus) as string[]).includes(value!);

/**
 * Конвейер в адресе: конвейер и вкладка — в пути, открытые клетка, ролик и
 * герой и фильтр библиотеки — в параметрах. Ссылку можно переслать.
 */
export const usePipelineParams = () => {
  const { project = '', tab } = useParams<{ project: string; tab?: string }>();
  const [params, setParams] = useSearchParams();
  const filterParam = params.get(FILTER_PARAM);

  const update = useCallback((patch: Record<string, string | null>, replace = true) => setParams((current) => {
    const next = new URLSearchParams(current);
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    return next;
  }, { replace }), [setParams]);

  return {
    project,
    tab: isTab(tab) ? tab : null,
    cell: params.get(PIPELINE_CELL_PARAM),
    video: params.get(PIPELINE_VIDEO_PARAM),
    hero: params.get(PIPELINE_HERO_PARAM),
    filter: isCellStatus(filterParam) ? filterParam : null,
    openCell: (key: string) => update({ [PIPELINE_CELL_PARAM]: key, [PIPELINE_VIDEO_PARAM]: null, [PIPELINE_HERO_PARAM]: null }, false),
    openVideo: (number: string) => update({ [PIPELINE_VIDEO_PARAM]: number, [PIPELINE_CELL_PARAM]: null, [PIPELINE_HERO_PARAM]: null }, false),
    openHero: (key: string) => update({ [PIPELINE_HERO_PARAM]: key, [PIPELINE_CELL_PARAM]: null, [PIPELINE_VIDEO_PARAM]: null }, false),
    closeSheets: () => update({ [PIPELINE_CELL_PARAM]: null, [PIPELINE_VIDEO_PARAM]: null, [PIPELINE_HERO_PARAM]: null }),
    setFilter: (status: PipelineCellStatus | null) => update({ [FILTER_PARAM]: status }),
  };
};
