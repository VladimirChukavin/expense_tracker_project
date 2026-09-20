import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetsApi } from '../api/budgetsApi';
import { BudgetFilters } from '@/types/api';
import toast from 'react-hot-toast';

export const useBudgets = (filters?: BudgetFilters) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['budgets', filters],
    queryFn: () => budgetsApi.getBudgets(filters),
    staleTime: 30000,
  });

  const { data: alerts, isLoading: isLoadingAlerts } = useQuery({
    queryKey: ['budgets', 'alerts'],
    queryFn: budgetsApi.getAlerts,
    staleTime: 30000,
  });

  const { data: exceededBudgets, isLoading: isLoadingExceeded } = useQuery({
    queryKey: ['budgets', 'exceeded'],
    queryFn: budgetsApi.getExceededBudgets,
    staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: budgetsApi.createBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Бюджет создан');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Ошибка при создании бюджета';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<any> }) =>
      budgetsApi.updateBudget(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Бюджет обновлен');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Ошибка при обновлении бюджета';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: budgetsApi.deleteBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Бюджет удален');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Ошибка при удалении бюджета';
      toast.error(message);
    },
  });

  return {
    budgets: data?.results || [],
    count: data?.count || 0,
    alerts: alerts || [],
    exceededBudgets: exceededBudgets || [],
    isLoading,
    isLoadingAlerts,
    isLoadingExceeded,
    error,
    createBudget: createMutation.mutate,
    updateBudget: updateMutation.mutate,
    deleteBudget: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
