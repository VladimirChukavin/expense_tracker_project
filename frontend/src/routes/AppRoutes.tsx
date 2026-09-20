import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { MainLayout } from '@/components/layout/MainLayout';
import { PrivateRoute } from './PrivateRoute';
import { ExpensesPage } from '@/features/expenses/pages/ExpensesPage';
import { CategoriesPage } from '@/features/categories/pages/CategoriesPage';
import { BudgetsPage } from '@/features/budgets/pages/BudgetsPage';
import { DashboardPage } from '@/features/analytics/pages/DashboardPage';
import { AnalyticsPage } from '@/features/analytics/pages/AnalyticsPage';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout>
              <DashboardPage />
            </MainLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/expenses"
        element={
          <PrivateRoute>
            <MainLayout>
              <ExpensesPage />
            </MainLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/categories"
        element={
          <PrivateRoute>
            <MainLayout>
              <CategoriesPage />
            </MainLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/budgets"
        element={
          <PrivateRoute>
            <MainLayout>
              <BudgetsPage />
            </MainLayout>
          </PrivateRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <PrivateRoute>
            <MainLayout>
              <AnalyticsPage />
            </MainLayout>
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
