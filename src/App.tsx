import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { RequireAuth } from '@/components/auth/RequireAuth';
import { AdminLayout } from '@/layouts/AdminLayout';
import { ViewerLayout } from '@/layouts/ViewerLayout';

// Public Pages
import { TourListPage } from '@/pages/public/TourListPage';
import { TourViewerPage } from '@/pages/public/TourViewerPage';

// Admin Pages
import { LoginPage } from '@/pages/admin/LoginPage';
import { DashboardPage } from '@/pages/admin/DashboardPage';
import { ToursPage } from '@/pages/admin/ToursPage';
import { TourDetailPage } from '@/pages/admin/TourDetailPage';
import { SceneDetailPage } from '@/pages/admin/SceneDetailPage';
import { UsersPage } from '@/pages/admin/UsersPage';
import { AccountPage } from '@/pages/admin/AccountPage';
import { SystemSettingsPage } from '@/pages/admin/SystemSettingsPage';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes — data considered fresh
      gcTime: 30 * 60 * 1000,         // 30 minutes — keep in memory
      retry: 2,                        // retry failed requests twice
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000), // exponential backoff
      refetchOnWindowFocus: false,     // don't refetch just because user switched tabs
      refetchOnReconnect: true,        // DO refetch when network comes back
    },
    mutations: {
      retry: 0,                        // never retry mutations automatically
    },
  },
});

const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    element: <Navigate to="/tours" replace />,
  },
  {
    path: '/tours',
    element: <TourListPage />,
  },
  {
    element: <ViewerLayout />,
    children: [
      {
        path: '/tour/:slug',
        element: <TourViewerPage />,
      },
    ],
  },
  // Admin Login
  {
    path: '/admin/login',
    element: <LoginPage />,
  },
  // Protected Admin Layout
  {
    path: '/admin',
    element: <RequireAuth />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: 'tours',
            element: <ToursPage />,
          },
          {
            path: 'tours/:tourId',
            element: <TourDetailPage />,
          },
          {
            path: 'tours/:tourId/scenes/:sceneId',
            element: <SceneDetailPage />,
          },
          {
            path: 'users',
            element: <UsersPage />,
          },
          {
            path: 'account',
            element: <AccountPage />,
          },
          {
            path: 'settings',
            element: <SystemSettingsPage />,
          },
        ],
      },
    ],
  },
  // 404 Fallback
  {
    path: '*',
    element: (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">404</h1>
        <p className="text-sm text-gray-500 mt-2">Page not found</p>
        <a
          href="/"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-accent text-white text-sm font-medium rounded-md hover:bg-accent-hover transition-colors"
        >
          Go back home
        </a>
      </div>
    ),
  },
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  } as any,
});

import { AuthInitializer } from '@/components/auth/AuthInitializer';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        <div className="overflow-x-hidden">
          <RouterProvider router={router} />
        </div>
      </AuthInitializer>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'text-sm font-medium text-gray-900 bg-white border border-gray-100 rounded-lg shadow-md',
          duration: 3000,
        }}
      />
    </QueryClientProvider>
  );
}
