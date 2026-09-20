import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart } from '@/components/charts/LineChart';
import { ExpensesTrend as ExpensesTrendType } from '@/types/api';
import { formatDate } from '@/lib/formatters';

interface ExpensesTrendProps {
  data: ExpensesTrendType[];
}

export const ExpensesTrend = ({ data }: ExpensesTrendProps) => {
  const chartData = data.map((item) => ({
    date: formatDate(item.date, 'dd.MM'),
    value: parseFloat(item.total_amount),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Динамика расходов</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <LineChart data={chartData} height={350} label="Сумма расходов" />
        ) : (
          <p className="text-center text-gray-500 py-8">Нет данных</p>
        )}
      </CardContent>
    </Card>
  );
};
