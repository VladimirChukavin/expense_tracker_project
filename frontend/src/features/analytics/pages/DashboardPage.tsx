import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '../components/StatCard';
import { ExpensesByCategory } from '../components/ExpensesByCategory';
import { ExpensesTrend } from '../components/ExpensesTrend';
import { useAnalytics } from '../hooks/useAnalytics';
import { Wallet, TrendingUp, ShoppingCart, Calendar } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { formatCurrency } from '@/lib/formatters';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export const DashboardPage = () => {
  const [dateRange] = useState(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    return {
      start: format(start, 'yyyy-MM-dd'),
      end: format(end, 'yyyy-MM-dd'),
    };
  });

  const { summary, byCategory, trends, isLoading, error } = useAnalytics(
    dateRange.start,
    dateRange.end
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message="Ошибка загрузки аналитики" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Обзор ваших расходов за текущий месяц"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Всего расходов"
          value={formatCurrency(summary?.total ?? 0, summary?.currency || undefined)}
          icon={Wallet}
          color="text-blue-600"
        />
        <StatCard
          title="Количество"
          value={summary?.count ?? 0}
          icon={ShoppingCart}
          color="text-green-600"
        />
        <StatCard
          title="Средний чек"
          value={formatCurrency(summary?.average ?? 0, summary?.currency || undefined)}
          icon={TrendingUp}
          color="text-purple-600"
        />
        <StatCard
          title="Период"
          value="Текущий месяц"
          icon={Calendar}
          color="text-orange-600"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ExpensesByCategory data={byCategory} />
        <ExpensesTrend data={trends} />
      </div>
    </div>
  );
};
