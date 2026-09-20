import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart } from '@/components/charts/PieChart';
import { ExpensesByCategory as ExpensesByCategoryType } from '@/types/api';

interface ExpensesByCategoryProps {
  data: ExpensesByCategoryType[];
}

export const ExpensesByCategory = ({ data }: ExpensesByCategoryProps) => {
  const chartData = data.map((item) => ({
    name: item.category_name,
    value: parseFloat(item.total_amount),
    color: item.category_color,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Расходы по категориям</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <PieChart data={chartData} height={350} />
        ) : (
          <p className="text-center text-gray-500 py-8">Нет данных</p>
        )}
      </CardContent>
    </Card>
  );
};
