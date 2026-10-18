import { defineConfig } from 'orval';

/**
 * Хуки react-query из swagger.json team-api (`npm run api` пересобирает спеку
 * в easyapps-web-server и генерирует заново). Руками generated/ и models/ не
 * правим — перезапишутся.
 */
export default defineConfig({
  team: {
    input: { target: './swagger.json' },
    output: {
      mode: 'tags-split',
      target: './src/api/generated',
      schemas: './src/api/models',
      client: 'react-query',
      httpClient: 'axios',
      clean: true,
      // GET → useQuery, остальное → useMutation (поведение orval по умолчанию).
      // Свежесть данных (staleTime) задана один раз в QueryClient, а не в каждом хуке.
      override: {
        mutator: { path: './src/api/http.ts', name: 'customInstance' },
      },
    },
    hooks: { afterAllFilesWrite: 'prettier --write' },
  },
});
