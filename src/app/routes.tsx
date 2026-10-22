import { Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom';

import { AppShell } from '@/components/layout/AppShell';
import { RouteError } from '@/components/layout/RouteError';
import { LoginPage } from '@/features/auth/LoginPage';
import { lazyNamed } from '@/lib/lazyNamed';
import { PATHS } from './paths';

// Страницы грузятся лениво: на телефон не приходит код доски и графиков,
// пока их не открыли.
const OverviewPage = lazyNamed(() => import('@/features/overview/OverviewPage'), 'OverviewPage');
const MyTasksPage = lazyNamed(() => import('@/features/tasks/pages/MyTasksPage'), 'MyTasksPage');
const TasksPage = lazyNamed(() => import('@/features/tasks/pages/TasksPage'), 'TasksPage');
const TaskRedirect = lazyNamed(() => import('@/features/tasks/pages/TaskRedirect'), 'TaskRedirect');
const TaskArchivePage = lazyNamed(() => import('@/features/tasks/pages/TaskArchivePage'), 'TaskArchivePage');
const SettingsPage = lazyNamed(() => import('@/features/settings/SettingsPage'), 'SettingsPage');
const MorePage = lazyNamed(() => import('@/features/more/MorePage'), 'MorePage');
const ContentPlanPage = lazyNamed(() => import('@/features/media/plan/ContentPlanPage'), 'ContentPlanPage');
const MediaLibraryPage = lazyNamed(() => import('@/features/media/library/MediaLibraryPage'), 'MediaLibraryPage');
const FeedPage = lazyNamed(() => import('@/features/media/feed/FeedPage'), 'FeedPage');
const AnalyticsPage = lazyNamed(() => import('@/features/media/analytics/AnalyticsPage'), 'AnalyticsPage');
const MediaSettingsPage = lazyNamed(() => import('@/features/media/settings/MediaSettingsPage'), 'MediaSettingsPage');
const JournalPage = lazyNamed(() => import('@/features/agents/journal/JournalPage'), 'JournalPage');
const JournalReviewPage = lazyNamed(() => import('@/features/agents/review/JournalReviewPage'), 'JournalReviewPage');
const AgentsPage = lazyNamed(() => import('@/features/agents/connect/AgentsPage'), 'AgentsPage');
const KnowledgePage = lazyNamed(() => import('@/features/knowledge/KnowledgePage'), 'KnowledgePage');
const PipelineIndexPage = lazyNamed(() => import('@/features/pipeline/PipelineIndexPage'), 'PipelineIndexPage');
const PipelinePage = lazyNamed(() => import('@/features/pipeline/PipelinePage'), 'PipelinePage');
const ConnectorConsentPage = lazyNamed(() => import('@/features/agents/connector/ConnectorConsentPage'), 'ConnectorConsentPage');

const PageFallback = () => <div className="skeleton m-4 h-48 rounded-card lg:m-0" />;

const page = (element: ReactNode) => <Suspense fallback={<PageFallback />}>{element}</Suspense>;

const routes: RouteObject[] = [
  {
    // Ошибка на любой странице — свой экран, а не голое «Unexpected Application Error!» роутера.
    errorElement: <RouteError />,
    children: [
      { path: PATHS.login, element: <LoginPage /> },
      // Согласие приложения — без оболочки: открывается окном входа из Claude, вход проверяет сама.
      { path: PATHS.oauthConsent, element: page(<ConnectorConsentPage />) },
      {
        element: <AppShell />,
        children: [
          { index: true, element: page(<OverviewPage />) },
          { path: PATHS.myTasks, element: page(<MyTasksPage />) },
          { path: PATHS.tasks, element: page(<TasksPage />) },
          // Точный адрес выигрывает у `/tasks/:key` — «archive» не примут за ключ задачи.
          { path: PATHS.tasksArchive, element: page(<TaskArchivePage />) },
          { path: `${PATHS.tasks}/:key`, element: page(<TaskRedirect />) },
          { path: PATHS.settings, element: page(<SettingsPage />) },
          { path: PATHS.more, element: page(<MorePage />) },
          { path: PATHS.media.root, element: <Navigate to={PATHS.media.plan} replace /> },
          { path: PATHS.media.plan, element: page(<ContentPlanPage />) },
          { path: PATHS.media.library, element: page(<MediaLibraryPage />) },
          { path: PATHS.media.feed, element: page(<FeedPage />) },
          { path: PATHS.media.analytics, element: page(<AnalyticsPage />) },
          { path: PATHS.media.settings, element: page(<MediaSettingsPage />) },
          { path: PATHS.journal, element: page(<JournalPage />) },
          { path: PATHS.journalReview, element: page(<JournalReviewPage />) },
          { path: PATHS.agents, element: page(<AgentsPage />) },
          { path: PATHS.knowledge, element: page(<KnowledgePage />) },
          { path: PATHS.pipeline, element: page(<PipelineIndexPage />) },
          { path: `${PATHS.pipeline}/:project/:tab?`, element: page(<PipelinePage />) },
          { path: '*', element: <Navigate to={PATHS.overview} replace /> },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
