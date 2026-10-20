/**
 * Русское множественное число: plural(5, ['задача', 'задачи', 'задач']) → «задач».
 */
export const plural = (count: number, [one, few, many]: readonly [string, string, string]): string => {
  const mod10 = Math.abs(count) % 10;
  const mod100 = Math.abs(count) % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
};

/** «5 задач». */
export const pluralize = (count: number, forms: readonly [string, string, string]): string =>
  `${count} ${plural(count, forms)}`;

export const TASK_FORMS = ['задача', 'задачи', 'задач'] as const;
export const COMMENT_FORMS = ['комментарий', 'комментария', 'комментариев'] as const;
export const DAY_FORMS = ['день', 'дня', 'дней'] as const;
export const POST_FORMS = ['пост', 'поста', 'постов'] as const;
export const FILE_FORMS = ['файл', 'файла', 'файлов'] as const;
export const STEP_FORMS = ['шаг', 'шага', 'шагов'] as const;
export const PROMPT_FORMS = ['запрос', 'запроса', 'запросов'] as const;
export const WORK_FORMS = ['работа', 'работы', 'работ'] as const;
