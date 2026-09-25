import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '../components/StatCard';
import { ExpensesByCategory } from '../components/ExpensesByCategory';
import { ExpensesTrend } from '../components/ExpensesTrend';
import { TopExpenses } from '../components/TopExpenses';
import { useAnalytics } from '../hooks/useAnalytics';
import { useExpenses } from '@/features/expenses/hooks/useExpenses';
import { Wallet, TrendingUp, ShoppingCart } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { formatCurrency } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const AnalyticsPage = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [appliedDates, setAppliedDates] = useState({ start: '', end: '' });

  const { summary, byCategory, trends, isLoading, error } = useAnalytics(
    appliedDates.start,
    appliedDates.end
  );

  const { expenses, isLoading: isLoadingExpenses } = useExpenses({
    date_from: appliedDates.start,
    date_to: appliedDates.end,
  });

  const handleApplyFilters = () => {
    setAppliedDates({ start: startDate, end: endDate });
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setAppliedDates({ start: '', end: '' });
  };

  if (isLoading || isLoadingExpenses) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message="Ошибка загрузки аналитики" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Аналитика"
        description="Детальная статистика и аналитика расходов"
      />

      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Дата от</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Дата до</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={handleApplyFilters}>Применить</Button>
            <Button variant="outline" onClick={handleReset}>Сбросить</Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ExpensesByCategory data={byCategory} />
        <ExpensesTrend data={trends} />
      </div>

      <TopExpenses expenses={expenses} />
    </div>
  );
};
