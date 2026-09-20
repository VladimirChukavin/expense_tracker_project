import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { MainLayout } from '@/components/layout/MainLayout';
import { PrivateRoute } from './PrivateRoute';
import { ExpensesPage } from '@/features/expenses/pages/ExpensesPage';
import { CategoriesPage } from '@/features/categories/pages/CategoriesPage';

const DashboardPage = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
    <p className="text-gray-600">В разработке - здесь будет главная страница</p>
  </div>
);

const BudgetsPage = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Бюджеты</h1>
    <p className="text-gray-600">В разработке</p>
  </div>
);

const AnalyticsPage = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Аналитика</h1>
    <p className="text-gray-600">В разработке</p>
  </div>
);

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
