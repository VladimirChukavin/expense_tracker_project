import { Budget } from '@/types/models';
import { BUDGET_THRESHOLD_COLORS } from '@/lib/constants';

interface BudgetProgressProps {
  budget: Budget;
  showLabel?: boolean;
}

export const BudgetProgress = ({ budget, showLabel = true }: BudgetProgressProps) => {
  const amount = parseFloat(budget.amount);
  const spent = budget.spent_amount ?? 0;
  const percentage = Math.min((spent / amount) * 100, 100);

  const getColor = () => {
    if (percentage >= 100) return BUDGET_THRESHOLD_COLORS.danger;
    if (percentage >= 80) return BUDGET_THRESHOLD_COLORS.warning;
    return BUDGET_THRESHOLD_COLORS.safe;
  };

  const color = getColor();

  return (
    <div className="space-y-2">
      <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-300 rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-sm">
          <span style={{ color }}>
            {percentage.toFixed(1)}% использовано
          </span>
          <span className="text-gray-600">
            {spent.toFixed(2)} / {amount.toFixed(2)} ₽
          </span>
        </div>
      )}
    </div>
  );
};
