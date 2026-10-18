# Заметки для Claude Code

Фронт team.easyapps.click. Устройство — [`MAP.md`](MAP.md): читай её в начале
задачи и правь тем же коммитом, если разошлась с кодом (двигай `map-base`).
API — `team-api` в соседнем репозитории `easyapps-web-server`
(`src/services/team-api`, его карта и ТЗ там же).

## Клиент API

`src/api/generated` и `src/api/models` генерирует orval — руками не правим.
Поменялся API → в соседнем репозитории правится YAML (`docs/paths`,
`docs/schemas`), здесь — `npm run api` (пересобирает `swagger.json` и хуки).

## Зеркала сервера

Разметка текста поста и лимиты площадок живут в двух местах:
`src/features/media/lib/{markup,rules}.ts` здесь и
`media/{textFormat,platformRules}.ts` в team-api. Меняешь одно — меняй второе.

## Проверка

```bash
npx tsc -b
```

```bash
npm run lint
```

```bash
npm test
```

```bash
npm run build
```

После сборки — в `dist/index.html` не должно быть `modulepreload` на `charts-*`
и `dnd-*` (графики и перетаскивание грузятся только своими страницами).

## Сдача работы

Коммить в `main` сразу, как правка готова. Пушит человек — дай команду
отдельным блоком (одна команда, тег `bash`, полный путь):

```bash
git -C /Users/ibrahim/Desktop/dev/easyapps-team-web-client push origin main
```

Timeweb Apps собирает `main` сам (`npm run build`, `dist`, SPA-фолбэк,
`VITE_API_BASE_URL=https://team-api.easyapps.click/api`).
