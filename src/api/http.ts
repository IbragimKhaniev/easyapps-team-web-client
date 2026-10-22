import Axios, { AxiosError, AxiosRequestConfig } from 'axios';

import { markPageLeaving } from '@/lib/appUpdate';

/**
 * HTTP-клиент для хуков orval. В проде — `VITE_API_BASE_URL`
 * (`https://team-api.easyapps.click/api`), локально — `/api` через прокси vite.
 * Cookie сессии уходит с каждым запросом (`withCredentials`).
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/** Страницы, где 401 — норма, а не повод отправлять на вход. */
const PUBLIC_PATHS = ['/login'];

export const LOGIN_PATH = '/login';

export const axiosInstance = Axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

/** Сессия закончилась — на вход, с возвратом туда, где был человек. */
const redirectToLogin = (): void => {
  const { pathname, search } = window.location;
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) return;
  const back = encodeURIComponent(`${pathname}${search}`);
  // Переход оборвёт недогруженные чанки — их сбой не повод для экрана обновления
  markPageLeaving();
  window.location.assign(`${LOGIN_PATH}?redirect=${back}`);
};

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) redirectToLogin();
    return Promise.reject(error);
  },
);

/** Мутатор orval: тело ответа (`{ success, data, meta }`) и отмена запроса. */
export const customInstance = <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> => {
  const controller = new AbortController();
  const promise = axiosInstance({ ...config, ...options, signal: config.signal ?? controller.signal })
    .then(({ data }) => data as T);
  // react-query отменяет устаревшие запросы через этот метод.
  (promise as Promise<T> & { cancel?: () => void }).cancel = () => controller.abort();
  return promise;
};

export type ErrorType<Error> = AxiosError<Error>;
export type BodyType<BodyData> = BodyData;
