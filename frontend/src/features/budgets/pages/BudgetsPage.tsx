import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { BudgetList } from '../components/BudgetList';
import { BudgetForm } from '../components/BudgetForm';
import { useBudgets } from '../hooks/useBudgets';
import { Button } from '@/components/ui/button';
import { Plus, AlertTriangle } from 'lucide-react';
import { Budget } from '@/types/models';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { ErrorMessage } from '@/components/common/ErrorMessage';

export const BudgetsPage = () => {
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | undefined>();
  const [budgetToDelete, setBudgetToDelete] = useState<number | null>(null);

  const {
    budgets,
    exceededBudgets,
    isLoading,
    error,
    createBudget,
    updateBudget,
    deleteBudget,
    isCreating,
    isUpdating,
    isDeleting,
  } = useBudgets();

  const handleEdit = (budget: Budget) => {
    setBudgetToEdit(budget);
    setFormDialogOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setBudgetToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (budgetToDelete) {
      deleteBudget(budgetToDelete);
      setDeleteDialogOpen(false);
      setBudgetToDelete(null);
    }
  };

  const handleFormSubmit = (data: any) => {
    if (budgetToEdit) {
      updateBudget({ id: budgetToEdit.id, data });
    } else {
      createBudget(data);
    }
    setFormDialogOpen(false);
    setBudgetToEdit(undefined);
  };

  const handleAddNew = () => {
    setBudgetToEdit(undefined);
    setFormDialogOpen(true);
  };

  if (error) {
    return <ErrorMessage message="Ошибка загрузки бюджетов" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Бюджеты"
        description="Управление бюджетами и контроль расходов"
        action={
          <Button onClick={handleAddNew}>
            <Plus size={16} className="mr-2" />
            Добавить бюджет
          </Button>
        }
      />

      {exceededBudgets && exceededBudgets.length > 0 && (
        <Card className="border-red-500 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-600 mt-0.5" size={20} />
              <div>
                <h3 className="font-medium text-red-900 mb-1">
                  Превышение бюджета
                </h3>
                <p className="text-sm text-red-800">
                  {exceededBudgets.length} {exceededBudgets.length === 1 ? 'бюджет превышен' : 'бюджетов превышено'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <BudgetList
        budgets={budgets}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {budgetToEdit ? 'Редактировать бюджет' : 'Добавить бюджет'}
            </DialogTitle>
          </DialogHeader>
          <BudgetForm
            budget={budgetToEdit}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setFormDialogOpen(false);
              setBudgetToEdit(undefined);
            }}
            isLoading={isCreating || isUpdating}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить бюджет?</DialogTitle>
            <DialogDescription>
              Это действие нельзя отменить. Бюджет будет удален навсегда.
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
    </div>
  );
};
