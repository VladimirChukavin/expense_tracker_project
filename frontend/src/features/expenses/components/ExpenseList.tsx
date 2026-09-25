import { useState } from 'react';
import { ExpenseCard } from './ExpenseCard';
import { useExpenses } from '../hooks/useExpenses';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Expense } from '@/types/models';
import { ExpenseFilters } from '@/types/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ExpenseListProps {
  filters?: ExpenseFilters;
  onEdit?: (expense: Expense) => void;
}

export const ExpenseList = ({ filters, onEdit }: ExpenseListProps) => {
  const [page, setPage] = useState(1);
  const { expenses, isLoading, error, deleteExpense, isDeleting, count } =
    useExpenses({ ...filters, page });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<number | null>(null);

  const handleDeleteClick = (id: number) => {
    setExpenseToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (expenseToDelete) {
      deleteExpense(expenseToDelete);
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={
          error instanceof Error
            ? `Ошибка загрузки расходов: ${error.message}`
            : 'Ошибка загрузки расходов'
        }
      />
    );
  }

  if (!expenses || expenses.length === 0) {
    return (
      <EmptyState
        title="Нет расходов"
        description="Добавьте ваш первый расход"
      />
    );
  }

  const hasMore = expenses.length < count;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {expenses.map((expense) => (
          <ExpenseCard
            key={expense.id}
            expense={expense}
            onEdit={onEdit}
            onDelete={handleDeleteClick}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-4">
          <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
            Загрузить ещё ({expenses.length} из {count})
          </Button>
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить расход?</DialogTitle>
            <DialogDescription>
              Это действие нельзя отменить. Расход будет удален навсегда.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Удаление...' : 'Удалить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
