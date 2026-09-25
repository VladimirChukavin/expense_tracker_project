import { Budget } from '@/types/models';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BudgetProgress } from './BudgetProgress';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, AlertTriangle } from 'lucide-react';
import { formatDate } from '@/lib/formatters';
import { BUDGET_PERIODS } from '@/lib/constants';

interface BudgetCardProps {
  budget: Budget;
  onEdit?: (budget: Budget) => void;
  onDelete?: (id: number) => void;
}

export const BudgetCard = ({ budget, onEdit, onDelete }: BudgetCardProps) => {
  const amount = parseFloat(budget.amount);
  const spent = budget.spent_amount ?? 0;
  const isExceeded = budget.is_exceeded ?? spent >= amount;
  const periodLabel = BUDGET_PERIODS.find(p => p.value === budget.period)?.label || budget.period;

  return (
    <Card className={`hover:shadow-md transition-shadow ${isExceeded ? 'border-red-500' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {budget.name}
              {isExceeded && <AlertTriangle size={18} className="text-red-500" />}
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">{periodLabel}</p>
          </div>
          <div className="flex gap-1">
            {onEdit && (
              <Button variant="ghost" size="icon" onClick={() => onEdit(budget)}>
                <Edit size={16} />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="icon" onClick={() => onDelete(budget.id)}>
                <Trash2 size={16} className="text-red-500" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <BudgetProgress budget={budget} />

        <div className="flex justify-between text-xs text-gray-500">
          <span>Начало: {formatDate(budget.start_date)}</span>
          {budget.end_date && <span>Конец: {formatDate(budget.end_date)}</span>}
        </div>

        {budget.category && (
          <div className="text-sm text-gray-600">
            Категория: <span className="font-medium">ID {budget.category}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
