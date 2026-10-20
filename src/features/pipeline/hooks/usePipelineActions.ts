import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import {
  getGetPipelineStateQueryKey,
  getListPipelineEventsQueryKey,
  uploadPipelineFile,
  useAddPipelineEvent,
  useReviewPipelineVideo,
  useSetPipelineNext,
  useSetPipelineVideoStatus,
  useUpdatePipelineCell,
  useUpdatePipelineCharacter,
} from '@/api/generated/pipeline/pipeline';
import {
  ReviewPipelineVideoInputDecision,
  UploadPipelineFileTarget,
  type PipelineNextMove,
  type PipelineVideoStatus,
  type UpdatePipelineCellInputStatus,
  type UpdatePipelineCharacterInput,
} from '@/api/models';
import { apiErrorMessage } from '@/lib/errors';

const PERCENT = 100;

export interface IUploadTarget {
  target: UploadPipelineFileTarget;
  character: string;
  scene?: string;
}

/**
 * Действия людей в конвейере: статус и заметка клетки, решение по ролику,
 * правка героя, ходы, запись в журнал, загрузка клипа, кадра и листа. После
 * каждого — перечитать состояние; ошибка — тостом с текстом сервера.
 */
export const usePipelineActions = (project: string) => {
  const queryClient = useQueryClient();
  const updateCell = useUpdatePipelineCell();
  const review = useReviewPipelineVideo();
  const setStatus = useSetPipelineVideoStatus();
  const updateCharacter = useUpdatePipelineCharacter();
  const setNext = useSetPipelineNext();
  const addEvent = useAddPipelineEvent();
  const [uploading, setUploading] = useState(false);

  const refresh = useCallback(() => Promise.all([
    queryClient.invalidateQueries({ queryKey: getGetPipelineStateQueryKey(project) }),
    queryClient.invalidateQueries({ queryKey: getListPipelineEventsQueryKey(project) }),
  ]), [queryClient, project]);

  const guard = useCallback(async <T>(action: () => Promise<T>, failure: string, success?: string): Promise<T | null> => {
    try {
      const result = await action();
      await refresh();
      if (success) toast.success(success);
      return result;
    } catch (error) {
      toast.error(apiErrorMessage(error, failure));
      return null;
    }
  }, [refresh]);

  const upload = useCallback(async (file: File, target: IUploadTarget, success: string) => {
    const toastId = toast.loading(`Загружаю «${file.name}»…`);
    setUploading(true);
    try {
      await uploadPipelineFile(project, { file }, target, {
        onUploadProgress: (event) => {
          if (event.total) toast.loading(`Загружаю «${file.name}» — ${Math.round((event.loaded / event.total) * PERCENT)}%`, { id: toastId });
        },
      });
      await refresh();
      toast.success(success, { id: toastId });
      return true;
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Файл не загрузился'), { id: toastId });
      return false;
    } finally {
      setUploading(false);
    }
  }, [project, refresh]);

  return {
    busy: uploading || updateCell.isPending || review.isPending || setStatus.isPending || updateCharacter.isPending || setNext.isPending || addEvent.isPending,
    setCellStatus: (cell: string, status: UpdatePipelineCellInputStatus, label: string) => {
      const [character, scene] = cell.split('/');
      return guard(() => updateCell.mutateAsync({ project, character: character!, scene: scene!, data: { status } }), 'Статус не сохранился', `Статус: ${label}`);
    },
    saveCellNote: (cell: string, note: string) => {
      const [character, scene] = cell.split('/');
      return guard(() => updateCell.mutateAsync({ project, character: character!, scene: scene!, data: { note } }), 'Заметка не сохранилась', 'Заметка сохранена');
    },
    approve: (number: string, comment: string) =>
      guard(() => review.mutateAsync({ project, number, data: { decision: ReviewPipelineVideoInputDecision.approved, comment } }), 'Решение не сохранилось', 'Ролик одобрен'),
    requestChanges: (number: string, comment: string) =>
      guard(() => review.mutateAsync({ project, number, data: { decision: ReviewPipelineVideoInputDecision.changes, comment } }), 'Решение не сохранилось', 'Правки отправлены агенту'),
    setVideoStatus: (number: string, status: PipelineVideoStatus) =>
      guard(() => setStatus.mutateAsync({ project, number, data: { status } }), 'Статус не сохранился', 'Статус ролика изменён'),
    updateCharacter: (key: string, data: UpdatePipelineCharacterInput) =>
      guard(() => updateCharacter.mutateAsync({ project, key, data }), 'Герой не сохранился', 'Герой сохранён'),
    setNextMoves: (moves: PipelineNextMove[]) =>
      guard(() => setNext.mutateAsync({ project, data: { moves } }), 'Ходы не сохранились', 'Ходы сохранены'),
    addNote: (text: string, ref?: string) =>
      guard(() => addEvent.mutateAsync({ project, data: { text, ...(ref ? { ref } : {}) } }), 'Запись не сохранилась', 'Записано в журнал'),
    uploadClip: (cell: string, file: File) => {
      const [character, scene] = cell.split('/');
      return upload(file, { target: UploadPipelineFileTarget.clip, character: character!, scene }, 'Клип загружен — клетка готова');
    },
    uploadFrame: (cell: string, file: File) => {
      const [character, scene] = cell.split('/');
      return upload(file, { target: UploadPipelineFileTarget.frame, character: character!, scene }, 'Кадр загружен');
    },
    uploadSheet: (character: string, file: File) =>
      upload(file, { target: UploadPipelineFileTarget.sheet, character }, 'Лист персонажа загружен'),
  };
};

export type TPipelineActions = ReturnType<typeof usePipelineActions>;
