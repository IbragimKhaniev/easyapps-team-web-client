/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Адрес API: в проде `https://team-api.easyapps.click/api`, локально не задан (прокси vite). */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
