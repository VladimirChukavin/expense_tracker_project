import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesApi } from '../api/expensesApi';
import { ExpenseFilters } from '@/types/api';
import toast from 'react-hot-toast';

export const useExpenses = (filters?: ExpenseFilters) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => expensesApi.getExpenses(filters),
    staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: expensesApi.createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Расход добавлен');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Ошибка при добавлении расхода';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) =>
      expensesApi.updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Расход обновлен');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Ошибка при обновлении расхода';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: expensesApi.deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Расход удален');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Ошибка при удалении расхода';
      toast.error(message);
    },
  });

  return {
    expenses: data?.results || [],
    count: data?.count || 0,
    next: data?.next,
    previous: data?.previous,
    isLoading,
    error,
    createExpense: createMutation.mutate,
    updateExpense: updateMutation.mutate,
    deleteExpense: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useExpense = (id: number) => {
  return useQuery({
    queryKey: ['expenses', id],
    queryFn: () => expensesApi.getExpense(id),
    enabled: !!id,
  });
};
