import apiClient from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants';
import { Expense } from '@/types/models';
import { PaginatedResponse, ExpenseFilters } from '@/types/api';

export const expensesApi = {
  getExpenses: async (filters?: ExpenseFilters): Promise<PaginatedResponse<Expense>> => {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await apiClient.get(`${API_ENDPOINTS.EXPENSES.LIST}?${params.toString()}`);
    return response.data;
  },

  getExpense: async (id: number): Promise<Expense> => {
    const response = await apiClient.get(API_ENDPOINTS.EXPENSES.DETAIL(id));
    return response.data;
  },

  createExpense: async (data: FormData): Promise<Expense> => {
    const response = await apiClient.post(API_ENDPOINTS.EXPENSES.CREATE, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateExpense: async (id: number, data: FormData): Promise<Expense> => {
    const response = await apiClient.put(API_ENDPOINTS.EXPENSES.UPDATE(id), data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteExpense: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.EXPENSES.DELETE(id));
  },
};
