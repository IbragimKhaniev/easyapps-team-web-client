<!-- map-covers: src -->
<!-- map-base: 6c50b3a -->

# Карта: фронт team.easyapps.click

Рабочее место команды easyapps: трекер задач, медиасистема (контент-план,
конструктор постов, медиатека, лента площадок, аналитика, «Площадки») и
агенты — плагин easyapps-team для Claude Code и Codex, журнал их работы,
разбор и база знаний по направлениям. На
iPhone — как приложение (PWA, крупные заголовки, стеклянный таббар, шторки),
на компьютере — дашборд в стиле референса Donezo в цветах easyapps.
API — `team-api` из `easyapps-web-server` (его карта —
`src/services/team-api/MAP.md` там).

**Точка входа:** `src/main.tsx` → `App.tsx` → `app/routes.tsx` (страницы лениво)
**Запуск:** `npm run dev` (5300, `/api` → локальный team-api :3100)

## Где что лежит

| Что | Где | Зачем знать |
|---|---|---|
| Маршруты, адреса, навигация | `app/routes.tsx`, `app/paths.ts`, `app/navigation.ts` | адреса только из `PATHS`; `?task=`, `?post=` — слои поверх экрана |
| Оболочка | `components/layout/AppShell.tsx` (+ Sidebar, Topbar, MobileTabBar, PageHeader) | общие слои: карточка задачи, конструктор поста, загрузки, ⌘K |
| Клиент API | `api/http.ts` (мутатор orval), `api/generated`, `api/models` — генерируются | руками не править; `npm run api` |
| Токены дизайна | `tailwind.config.ts`, `index.css` (`card-surface`, `tile-brand`, `tile-deep`, `bg-hatched`) | цвета — шкала `brand` вокруг `#3CC1F6` |
| Общие компоненты | `components/common` — `Card`, `KpiCard`, `SegmentedControl`, `AdaptivePicker`, `ResponsiveDialog`, `EmptyState` | выбор и окна, родные на обоих экранах |
| Трекер | `features/tasks` (страницы, карточка `TaskSheet`, доска, пикеры, кэш `lib/cache.ts`) | оптимистичные правки во всех списках |
| Сводка | `features/overview` (+ `widgets/MediaPulseCard` — ближайшая публикация) | |
| Медиа: общее | `features/media/lib` — `platforms`, `status`, `format`, `markup`, `rules`, `calendar`, `cache`, `chartTheme`; `features/media/components` | разметка и лимиты — зеркало сервера |
| Контент-план | `features/media/plan` — `ContentPlanPage`, `MonthGrid` (перетаскивание по дням), `DayPanel`, `CompactMonth` (телефон) | месяц/день/площадка — в адресе |
| Конструктор поста | `features/media/composer` — `PostComposerHost` → `PostComposerSheet` → `PostComposer`; `model.ts`, `hooks/usePostActions.ts` | открывается `?post=<id>` или `?post=new&date=` |
| Медиатека | `features/media/library` + очередь загрузок `media/hooks/uploadQueue.ts` | файл грузится и после закрытия окна |
| Лента и аналитика | `features/media/feed`, `features/media/analytics` (recharts) | графики — только в этих страницах |
| Площадки | `features/media/settings` — форма по `fields` с сервера, вход MTProto, хранилище, фоновые задачи | |
| Агенты: журнал | `features/agents/journal` — `JournalPage` (живые работы, по дням, фильтры в адресе `useJournalFilters`) | без фильтра лента — закрытые работы, живые — блоком сверху |
| Агенты: разбор | `features/agents/review` — `JournalReviewPage`, `ReviewItemsCard`, `PeopleCard`, `DaysCard` | сутки разбора — UTC, как вся статистика |
| Агенты и плагин | `features/agents/connect` — `AgentsPage`, `ConnectWizard` (агент → ключ и промт установки плагина → «Подключено» / «Автожурнал работает»), `KeysCard`, `TeamAgentsCard` | промт и сам плагин собирает сервер; ключ — только по кнопке |
| Работа журнала | `features/agents/components` — `WorkSheet` (`?work=` поверх любого экрана, лениво через `WorkHost`), `WorkCard`, `WorkTimeline`, `WorkBadges`; вид — `features/agents/lib/journalMeta.ts` | живая работа перечитывается раз в 5 с |
| База знаний | `features/knowledge` — `KnowledgePage` (разделы колонкой с 1280px, уже — чипами; поиск, вид, метка, раздел — в адресе `useKnowledgeParams`), `KnowledgeEntrySheet` (`?entry=`), `KnowledgeEditor`, `SectionsManager` (админ), действия — `hooks/useKnowledgeActions.ts`; вид — `lib/knowledgeMeta.ts` | поиск — на сервере (`$text`, русская морфология) |
| Агенты в задаче и сводке | вкладка «Агенты» — `tasks/components/detail/TaskWork.tsx` (+ `hooks/useTaskWorkCount.ts`), «через claude-code» в `TaskHistory.tsx`; `overview/widgets/AgentsNowCard.tsx` | |

## Как это работает

- **Данные** — только хуки orval и react-query. Свежесть — `app/queryClient.ts`
  (10 с), экраны медиа перечитываются сами: план — 30 с, пост в публикации —
  4 с, задачи — 5 с, лента — минута.
- **Слои поверх экрана** — параметры адреса: `?task=EA-42` (карточка задачи),
  `?post=…` (конструктор), `?asset=` (файл медиатеки), `?item=` (пост ленты),
  `?work=<id>` (работа журнала), `?entry=<id>` (запись базы знаний — на её
  странице). Ссылку можно переслать, «назад» закрывает слой. Окно грузит по
  `useLastPresent(id)` — пока оно закрывается, id в адресе уже пуст, а запись
  должна остаться на месте, иначе мелькает «не найдена».
- **Телефон/компьютер** — `useIsDesktop()` (≥1024px): на компьютере диалоги и
  поповеры, на телефоне шторки vaul (`ResponsiveDialog`, `AdaptivePicker`).
- **Загрузка файла** — `uploadQueue.add`: браузер снимает размеры и кадр видео
  (`lib/fileInfo.ts`), файл идёт через API потоком в S3 с прогрессом.

## Правила, которые нельзя нарушать

- **Разметка и лимиты площадок — зеркало сервера** (`media/lib/markup.ts`,
  `rules.ts` ↔ team-api `media/textFormat.ts`, `platformRules.ts`). Разошлись —
  счётчики врут, а пост падает на проверке.
- **HTML предпросмотра Telegram — только через `toTelegramHtml`**: текст
  экранируется целиком до вставки своих тегов, иначе XSS через текст поста.
- **Даты дней — строками `YYYY-MM-DD`**, арифметика через UTC (`lib/dates.ts`,
  `media/lib/calendar.ts`); момент публикации — `publishMomentOf` (пояс человека).
- **Иконки разделов базы знаний — зеркало сервера**: `SECTION_ICONS`
  (`features/knowledge/lib/knowledgeMeta.ts`) ↔ `KNOWLEDGE_SECTION_ICONS`
  (team-api `constants/knowledge.ts`). Нет иконки во фронте — раздел покажется
  книгой.
- **recharts и dnd-kit не в стартовом графе.** Проверка — в `dist/index.html`
  после `npm run build` нет `modulepreload` на `charts-*` и `dnd-*`. Утилиты
  классов — в своём чанке `classnames` (`vite.config.ts`), иначе rollup кладёт
  `clsx` в чанк графиков и тянет его на старте.

## Куда добавлять новое

### Новый экран медиа

1. Страница в `features/media/<раздел>/`, адрес — `PATHS.media` (`app/paths.ts`),
   маршрут — `app/routes.tsx` (`lazyPage`).
2. Пункт навигации — `NAV_SECTIONS` и `MEDIA_TABS` (`app/navigation.ts`).
3. На телефоне под заголовком — `MediaSectionTabs`.

### Новый вид записи журнала

Вид приходит из swagger (`JournalEntryKind`); подпись, значок и цвет — в
`ENTRY_KIND_META` (`features/agents/lib/journalMeta.ts`), особая отрисовка — в
`WorkTimeline.tsx`.

### Новый вид записи базы знаний

Вид приходит из swagger (`KnowledgeKind`); подпись, подсказка, значок и цвет —
`KIND_META` и порядок — `KIND_ORDER` (`features/knowledge/lib/knowledgeMeta.ts`).

### Новое поле API

`npm run api` после правки YAML в team-api — без строки в YAML поле до фронта
не доедет.

## Проверка

```bash
npx tsc -b && npm run lint && npm test && npm run build
```

Вживую — `npm run dev` + локальный team-api (база и S3 — карта team-api).
