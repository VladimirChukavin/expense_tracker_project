import { Budget } from '@/types/models';
import { BudgetCard } from './BudgetCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';

interface BudgetListProps {
  budgets: Budget[];
  isLoading?: boolean;
  onEdit?: (budget: Budget) => void;
  onDelete?: (id: number) => void;
}

export const BudgetList = ({ budgets, isLoading, onEdit, onDelete }: BudgetListProps) => {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!budgets || budgets.length === 0) {
    return (
      <EmptyState
        title="Нет бюджетов"
        description="Создайте ваш первый бюджет"
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {budgets.map((budget) => (
        <BudgetCard
          key={budget.id}
          budget={budget}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
