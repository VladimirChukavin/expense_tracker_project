import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { CategoryTree } from '../components/CategoryTree';
import { CategoryForm } from '../components/CategoryForm';
import { useCategories } from '../hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Plus, List, GitBranch } from 'lucide-react';
import { Category } from '@/types/models';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { CategoryList } from '../components/CategoryList';

type ViewMode = 'tree' | 'list';

export const CategoriesPage = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('tree');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | undefined>();
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

  const {
    categories,
    categoryTree,
    isLoading,
    isLoadingTree,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    isCreating,
    isUpdating,
    isDeleting,
  } = useCategories();

  const handleEdit = (category: Category) => {
    setCategoryToEdit(category);
    setFormDialogOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setCategoryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleFormSubmit = (data: any) => {
    if (categoryToEdit) {
      updateCategory({ id: categoryToEdit.id, data });
    } else {
      createCategory(data);
    }
    setFormDialogOpen(false);
    setCategoryToEdit(undefined);
  };

  const handleAddNew = () => {
    setCategoryToEdit(undefined);
    setFormDialogOpen(true);
  };

  if (isLoading || isLoadingTree) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message="Ошибка загрузки категорий" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Категории"
        description="Управление категориями расходов"
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode('tree')}
              className={viewMode === 'tree' ? 'bg-gray-100' : ''}
            >
              <GitBranch size={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-gray-100' : ''}
            >
              <List size={16} />
            </Button>
            <Button onClick={handleAddNew}>
              <Plus size={16} className="mr-2" />
              Добавить категорию
            </Button>
          </div>
        }
      />

      {viewMode === 'tree' ? (
        <CategoryTree
          categories={categoryTree}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      ) : (
        <CategoryList
          categories={categories}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      )}

      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {categoryToEdit ? 'Редактировать категорию' : 'Добавить категорию'}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm
            category={categoryToEdit}
            categories={categories}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setFormDialogOpen(false);
              setCategoryToEdit(undefined);
            }}
            isLoading={isCreating || isUpdating}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить категорию?</DialogTitle>
            <DialogDescription>
              Это действие нельзя отменить. Категория будет удалена навсегда.
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
