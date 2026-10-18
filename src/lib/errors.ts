import { isAxiosError } from 'axios';

interface IApiErrorBody {
  error?: {
    code?: string;
    message?: string;
    details?: { fieldErrors?: Record<string, string[] | undefined>; formErrors?: string[] };
  };
}

/**
 * Человеческий текст ошибки API. Валидация zod приходит как
 * `{ fieldErrors: { body: ['…'] } }` — показываем первое сообщение.
 */
export const apiErrorMessage = (error: unknown, fallback = 'Что-то пошло не так'): string => {
  if (isAxiosError<IApiErrorBody>(error)) {
    if (!error.response) return 'Нет связи с сервером';
    const body = error.response.data?.error;
    const fieldError = body?.details?.fieldErrors
      ? Object.values(body.details.fieldErrors).flat().find(Boolean)
      : undefined;
    const formError = body?.details?.formErrors?.find(Boolean);
    return fieldError || formError || body?.message || fallback;
  }
  return error instanceof Error && error.message ? error.message : fallback;
};

export const apiErrorStatus = (error: unknown): number | undefined =>
  isAxiosError(error) ? error.response?.status : undefined;
