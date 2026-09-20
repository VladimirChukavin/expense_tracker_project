import { Expense } from '@/types/models';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { Trash2, Edit, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExpenseCardProps {
  expense: Expense;
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: number) => void;
}

export const ExpenseCard = ({ expense, onEdit, onDelete }: ExpenseCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-semibold">
                {formatCurrency(expense.amount)}
              </span>
              {expense.receipt && (
                <Receipt size={16} className="text-gray-400" />
              )}
            </div>

            {expense.description && (
              <p className="text-sm text-gray-600 mb-2">{expense.description}</p>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{formatDate(expense.date)}</span>
            </div>

            {expense.tags && expense.tags.length > 0 && (
              <div className="flex gap-1 mt-2">
                {expense.tags.map((tagId) => (
                  <Badge key={tagId} variant="secondary" className="text-xs">
                    Tag {tagId}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(expense)}
              >
                <Edit size={16} />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(expense.id)}
              >
                <Trash2 size={16} className="text-red-500" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
