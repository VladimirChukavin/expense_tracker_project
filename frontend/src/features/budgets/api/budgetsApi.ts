import apiClient from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants';
import { Budget, BudgetAlert } from '@/types/models';
import { PaginatedResponse, BudgetFilters } from '@/types/api';

export const budgetsApi = {
  getBudgets: async (filters?: BudgetFilters): Promise<PaginatedResponse<Budget>> => {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get(`${API_ENDPOINTS.BUDGETS.LIST}?${params.toString()}`);
    return response.data;
  },

  getBudget: async (id: number): Promise<Budget> => {
    const response = await apiClient.get(API_ENDPOINTS.BUDGETS.DETAIL(id));
    return response.data;
  },

  createBudget: async (data: Partial<Budget>): Promise<Budget> => {
    const response = await apiClient.post(API_ENDPOINTS.BUDGETS.CREATE, data);
    return response.data;
  },

  updateBudget: async (id: number, data: Partial<Budget>): Promise<Budget> => {
    const response = await apiClient.put(API_ENDPOINTS.BUDGETS.UPDATE(id), data);
    return response.data;
  },

  deleteBudget: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.BUDGETS.DELETE(id));
  },

  getAlerts: async (): Promise<BudgetAlert[]> => {
    const response = await apiClient.get(API_ENDPOINTS.BUDGETS.ALERTS);
    return response.data;
  },

  getExceededBudgets: async (): Promise<Budget[]> => {
    const response = await apiClient.get(API_ENDPOINTS.BUDGETS.EXCEEDED);
    return response.data;
  },
};
