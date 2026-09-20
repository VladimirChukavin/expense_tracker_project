import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Expense } from '@/types/models';
import { formatCurrency, formatDate } from '@/lib/formatters';

interface TopExpensesProps {
  expenses: Expense[];
}

export const TopExpenses = ({ expenses }: TopExpensesProps) => {
  const sortedExpenses = [...expenses]
    .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Топ-10 расходов</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedExpenses.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead className="text-right">Сумма</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{formatDate(expense.date)}</TableCell>
                  <TableCell>{expense.description || 'Без описания'}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(expense.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-gray-500 py-8">Нет данных</p>
        )}
      </CardContent>
    </Card>
  );
};
