import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from '../shared/components/AppLayout';
import { NotFoundPage } from '../shared/components/NotFoundPage';
import { ProtectedRoute } from '../shared/components/ProtectedRoute';
import { LoadingScreen } from '../shared/components/LoadingScreen';

// Lazy loaded feature pages
const LoginPage = lazy(() => import('../features/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../features/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));

const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const KnowledgePage = lazy(() => import('../features/knowledge/KnowledgePage').then(m => ({ default: m.KnowledgePage })));
const WorkspacePage = lazy(() => import('../features/workspace/WorkspacePage').then(m => ({ default: m.WorkspacePage })));
const StudioPage = lazy(() => import('../features/studio/StudioPage').then(m => ({ default: m.StudioPage })));
const LibraryPage = lazy(() => import('../features/library/LibraryPage').then(m => ({ default: m.LibraryPage })));
const CalendarPage = lazy(() => import('../features/calendar/CalendarPage').then(m => ({ default: m.CalendarPage })));
const AnalyticsPage = lazy(() => import('../features/analytics/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const SettingsPage = lazy(() => import('../features/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));
const ProfilePage = lazy(() => import('../features/profile/ProfilePage').then(m => ({ default: m.ProfilePage })));

const router = createBrowserRouter([
  { 
    path: '/login', 
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <LoginPage />
      </Suspense>
    ) 
  },
  { 
    path: '/register', 
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <RegisterPage />
      </Suspense>
    ) 
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    errorElement: <NotFoundPage />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true, element: <Suspense fallback={<LoadingScreen />}><DashboardPage /></Suspense> },
          { path: 'knowledge', element: <Suspense fallback={<LoadingScreen />}><KnowledgePage /></Suspense> },
          { path: 'workspace', element: <Suspense fallback={<LoadingScreen />}><WorkspacePage /></Suspense> },
          { path: 'studio', element: <Suspense fallback={<LoadingScreen />}><StudioPage /></Suspense> },
          { path: 'writing', element: <Suspense fallback={<LoadingScreen />}><StudioPage /></Suspense> },
          { path: 'library', element: <Suspense fallback={<LoadingScreen />}><LibraryPage /></Suspense> },
          { path: 'calendar', element: <Suspense fallback={<LoadingScreen />}><CalendarPage /></Suspense> },
          { path: 'analytics', element: <Suspense fallback={<LoadingScreen />}><AnalyticsPage /></Suspense> },
          { path: 'settings', element: <Suspense fallback={<LoadingScreen />}><SettingsPage /></Suspense> },
          { path: 'profile', element: <Suspense fallback={<LoadingScreen />}><ProfilePage /></Suspense> },
        ]
      }
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
