import apiClient from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants';
import { AnalyticsSummary, ExpensesByCategory, ExpensesTrend } from '@/types/api';

export const analyticsApi = {
  getSummary: async (startDate?: string, endDate?: string): Promise<AnalyticsSummary> => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await apiClient.get(`${API_ENDPOINTS.ANALYTICS.SUMMARY}?${params.toString()}`);
    return response.data;
  },

  getByCategory: async (startDate?: string, endDate?: string): Promise<ExpensesByCategory[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await apiClient.get(`${API_ENDPOINTS.ANALYTICS.BY_CATEGORY}?${params.toString()}`);
    return response.data;
  },

  getTrends: async (startDate?: string, endDate?: string): Promise<ExpensesTrend[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await apiClient.get(`${API_ENDPOINTS.ANALYTICS.TRENDS}?${params.toString()}`);
    return response.data;
  },
};
