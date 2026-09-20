import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { ExpenseList } from '../components/ExpenseList';
import { ExpenseFilters } from '../components/ExpenseFilters';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Expense } from '@/types/models';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ExpenseForm } from '../components/ExpenseForm';
import { useExpenses } from '../hooks/useExpenses';

export const ExpensesPage = () => {
  const [filters, setFilters] = useState({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | undefined>();
  const { createExpense, updateExpense, isCreating, isUpdating } = useExpenses(filters);

  const handleEdit = (expense: Expense) => {
    setExpenseToEdit(expense);
    setEditDialogOpen(true);
  };

  const handleFormSubmit = (data: FormData) => {
    if (expenseToEdit) {
      updateExpense({ id: expenseToEdit.id, data });
    } else {
      createExpense(data);
    }
    setEditDialogOpen(false);
    setExpenseToEdit(undefined);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Расходы"
        description="Управление вашими расходами"
        action={
          <Button onClick={() => setEditDialogOpen(true)}>
            <Plus size={16} className="mr-2" />
            Добавить расход
          </Button>
        }
      />

      <ExpenseFilters onFilterChange={setFilters} />

      <ExpenseList filters={filters} onEdit={handleEdit} />

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {expenseToEdit ? 'Редактировать расход' : 'Добавить расход'}
            </DialogTitle>
          </DialogHeader>
          <ExpenseForm
            expense={expenseToEdit}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setEditDialogOpen(false);
              setExpenseToEdit(undefined);
            }}
            isLoading={isCreating || isUpdating}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
