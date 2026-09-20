import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../api/categoriesApi';
import toast from 'react-hot-toast';

export const useCategories = () => {
  const queryClient = useQueryClient();

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getCategories,
    staleTime: 60000,
  });

  const { data: categoryTree, isLoading: isLoadingTree } = useQuery({
    queryKey: ['categories', 'tree'],
    queryFn: categoriesApi.getCategoryTree,
    staleTime: 60000,
  });

  const createMutation = useMutation({
    mutationFn: categoriesApi.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Категория создана');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Ошибка при создании категории';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<any> }) =>
      categoriesApi.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Категория обновлена');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Ошибка при обновлении категории';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: categoriesApi.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Категория удалена');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Ошибка при удалении категории';
      toast.error(message);
    },
  });

  return {
    categories: categories || [],
    categoryTree: categoryTree || [],
    isLoading,
    isLoadingTree,
    error,
    createCategory: createMutation.mutate,
    updateCategory: updateMutation.mutate,
    deleteCategory: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
