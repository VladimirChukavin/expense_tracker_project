import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PrivateRoute } from './PrivateRoute';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// Lazy-загрузка страниц: каждый чанк подтягивается по мере надобности
const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('@/features/auth/pages/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);
const DashboardPage = lazy(() =>
  import('@/features/analytics/pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const ExpensesPage = lazy(() =>
  import('@/features/expenses/pages/ExpensesPage').then((m) => ({ default: m.ExpensesPage }))
);
const CategoriesPage = lazy(() =>
  import('@/features/categories/pages/CategoriesPage').then((m) => ({ default: m.CategoriesPage }))
);
const BudgetsPage = lazy(() =>
  import('@/features/budgets/pages/BudgetsPage').then((m) => ({ default: m.BudgetsPage }))
);
const AnalyticsPage = lazy(() =>
  import('@/features/analytics/pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage }))
);

const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center">
    <h1 className="text-6xl font-bold text-gray-900">404</h1>
    <p className="text-gray-600">Страница не найдена</p>
    <Button asChild>
      <Link to="/">На главную</Link>
    </Button>
  </div>
);

const withSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<LoadingSpinner />}>{element}</Suspense>
);

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={withSuspense(<LoginPage />)} />
      <Route path="/register" element={withSuspense(<RegisterPage />)} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout>
              {withSuspense(<DashboardPage />)}
            </MainLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/expenses"
        element={
          <PrivateRoute>
            <MainLayout>
              {withSuspense(<ExpensesPage />)}
            </MainLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/categories"
        element={
          <PrivateRoute>
            <MainLayout>
              {withSuspense(<CategoriesPage />)}
            </MainLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/budgets"
        element={
          <PrivateRoute>
            <MainLayout>
              {withSuspense(<BudgetsPage />)}
            </MainLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <PrivateRoute>
            <MainLayout>
              {withSuspense(<AnalyticsPage />)}
            </MainLayout>
          </PrivateRoute>
        }
      />

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};
