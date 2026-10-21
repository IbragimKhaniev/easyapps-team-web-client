import { lazy, Suspense, type ComponentType, type ReactNode } from 'react';
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom';

import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/features/auth/LoginPage';
import { PATHS } from './paths';

/**
 * Страницы грузятся лениво: на телефон не приходит код доски и графиков,
 * пока их не открыли.
 */
const lazyPage = <T extends Record<string, ComponentType>>(load: () => Promise<T>, name: keyof T) =>
  lazy(async () => ({ default: (await load())[name] }));

const OverviewPage = lazyPage(() => import('@/features/overview/OverviewPage'), 'OverviewPage');
const MyTasksPage = lazyPage(() => import('@/features/tasks/pages/MyTasksPage'), 'MyTasksPage');
const TasksPage = lazyPage(() => import('@/features/tasks/pages/TasksPage'), 'TasksPage');
const TaskRedirect = lazyPage(() => import('@/features/tasks/pages/TaskRedirect'), 'TaskRedirect');
const TaskArchivePage = lazyPage(() => import('@/features/tasks/pages/TaskArchivePage'), 'TaskArchivePage');
const SettingsPage = lazyPage(() => import('@/features/settings/SettingsPage'), 'SettingsPage');
const MorePage = lazyPage(() => import('@/features/more/MorePage'), 'MorePage');
const ContentPlanPage = lazyPage(() => import('@/features/media/plan/ContentPlanPage'), 'ContentPlanPage');
const MediaLibraryPage = lazyPage(() => import('@/features/media/library/MediaLibraryPage'), 'MediaLibraryPage');
const FeedPage = lazyPage(() => import('@/features/media/feed/FeedPage'), 'FeedPage');
const AnalyticsPage = lazyPage(() => import('@/features/media/analytics/AnalyticsPage'), 'AnalyticsPage');
const MediaSettingsPage = lazyPage(() => import('@/features/media/settings/MediaSettingsPage'), 'MediaSettingsPage');
const JournalPage = lazyPage(() => import('@/features/agents/journal/JournalPage'), 'JournalPage');
const JournalReviewPage = lazyPage(() => import('@/features/agents/review/JournalReviewPage'), 'JournalReviewPage');
const AgentsPage = lazyPage(() => import('@/features/agents/connect/AgentsPage'), 'AgentsPage');
const KnowledgePage = lazyPage(() => import('@/features/knowledge/KnowledgePage'), 'KnowledgePage');
const PipelineIndexPage = lazyPage(() => import('@/features/pipeline/PipelineIndexPage'), 'PipelineIndexPage');
const PipelinePage = lazyPage(() => import('@/features/pipeline/PipelinePage'), 'PipelinePage');
const ConnectorConsentPage = lazyPage(() => import('@/features/agents/connector/ConnectorConsentPage'), 'ConnectorConsentPage');

const PageFallback = () => <div className="skeleton m-4 h-48 rounded-card lg:m-0" />;

const page = (element: ReactNode) => <Suspense fallback={<PageFallback />}>{element}</Suspense>;

const routes: RouteObject[] = [
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
];

export const router = createBrowserRouter(routes);
