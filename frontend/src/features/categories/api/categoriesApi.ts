import apiClient from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants';
import { Category } from '@/types/models';

export const categoriesApi = {
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.LIST);
    return response.data;
  },

  getCategoryTree: async (): Promise<Category[]> => {
    const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.TREE);
    return response.data;
  },

  getCategory: async (id: number): Promise<Category> => {
    const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.DETAIL(id));
    return response.data;
  },

  createCategory: async (data: Partial<Category>): Promise<Category> => {
    const response = await apiClient.post(API_ENDPOINTS.CATEGORIES.CREATE, data);
    return response.data;
  },

  updateCategory: async (id: number, data: Partial<Category>): Promise<Category> => {
    const response = await apiClient.put(API_ENDPOINTS.CATEGORIES.UPDATE(id), data);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.CATEGORIES.DELETE(id));
  },
};
