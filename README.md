# easyapps-team-web-client

Фронтенд **team.easyapps.click** — рабочего места команды easyapps: трекер задач и
управление медиа. React 18 + Vite, react-query с хуками orval из swagger team-api,
tailwind + shadcn/ui. На iPhone — как приложение (PWA), на компьютере — дашборд.

API — сервис `team-api` в `easyapps-web-server` (`src/services/team-api`, ТЗ — `TZ.md` там же).

## Запуск

```bash
npm install
npm run dev          # http://localhost:5300, /api проксируется на локальный team-api :3100
```

API для разработки — `npm run team-api` в `easyapps-web-server` (нужна база, см. MAP сервиса).
Против боевого API: `VITE_PROXY_TARGET=https://team-api.easyapps.click VITE_PROXY_ORIGIN=https://team.easyapps.click npm run dev`.

## API-хуки

```bash
npm run api          # swagger.json из team-api + генерация хуков orval
```

`src/api/generated` и `src/api/models` руками не правим.

## Проверки

```bash
npm run typecheck && npm run lint && npm run build
```

## Выкладка

Timeweb Apps собирает `main` сам: `npm run build`, каталог `dist`, SPA-фолбэк на
`index.html`, переменная `VITE_API_BASE_URL=https://team-api.easyapps.click/api`.
