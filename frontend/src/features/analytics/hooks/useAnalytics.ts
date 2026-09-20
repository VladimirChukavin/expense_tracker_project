import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analyticsApi';

export const useAnalytics = (startDate?: string, endDate?: string) => {
  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['analytics', 'summary', startDate, endDate],
    queryFn: () => analyticsApi.getSummary(startDate, endDate),
    staleTime: 60000,
  });

  const { data: byCategory, isLoading: isLoadingByCategory } = useQuery({
    queryKey: ['analytics', 'by-category', startDate, endDate],
    queryFn: () => analyticsApi.getByCategory(startDate, endDate),
    staleTime: 60000,
  });

  const { data: trends, isLoading: isLoadingTrends } = useQuery({
    queryKey: ['analytics', 'trends', startDate, endDate],
    queryFn: () => analyticsApi.getTrends(startDate, endDate),
    staleTime: 60000,
  });

  return {
    summary,
    byCategory: byCategory || [],
    trends: trends || [],
    isLoading: isLoadingSummary || isLoadingByCategory || isLoadingTrends,
  };
};
