import { useMemo } from 'react';

import { useListLabels } from '@/api/generated/labels/labels';
import { useListProjects } from '@/api/generated/projects/projects';
import { useListMembers } from '@/api/generated/team/team';
import type { Label, Project, TeamMember } from '@/api/models';

/**
 * Справочники — команда, проекты, метки. Задачи ссылаются на них по id,
 * а сами справочники грузятся один раз и живут в кэше: меняются редко.
 */
const DIRECTORY_STALE_MS = 60_000;

const byId = <T extends { id: string }>(items: T[] | undefined): Map<string, T> =>
  new Map((items ?? []).map((item) => [item.id, item]));

export const useMembers = () => {
  const query = useListMembers({ query: { staleTime: DIRECTORY_STALE_MS } });
  const list: TeamMember[] = query.data?.data ?? [];
  const map = useMemo(() => byId(query.data?.data), [query.data]);
  return { list, map, isLoading: query.isLoading };
};

export const useProjects = (includeArchived = false) => {
  const query = useListProjects(
    includeArchived ? { includeArchived: 'true' } : undefined,
    { query: { staleTime: DIRECTORY_STALE_MS } },
  );
  const list: Project[] = query.data?.data ?? [];
  const map = useMemo(() => byId(query.data?.data), [query.data]);
  return { list, map, isLoading: query.isLoading };
};

export const useLabels = () => {
  const query = useListLabels(undefined, { query: { staleTime: DIRECTORY_STALE_MS } });
  const list: Label[] = query.data?.data ?? [];
  const map = useMemo(() => byId(query.data?.data), [query.data]);
  return { list, map, isLoading: query.isLoading };
};
