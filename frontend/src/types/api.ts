// API типы для запросов и ответов

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ErrorResponse {
  error: boolean;
  message: string;
  status_code: number;
  details?: Record<string, any>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  password2: string;
  first_name?: string;
  last_name?: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface RefreshTokenRequest {
  refresh: string;
}

export interface RefreshTokenResponse {
  access: string;
}

export interface ExpenseFilters {
  date_from?: string;
  date_to?: string;
  category?: number;
  tags?: string;
  min_amount?: number;
  max_amount?: number;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface BudgetFilters {
  period?: string;
  category?: number;
  is_exceeded?: boolean;
  page?: number;
  page_size?: number;
}

// Формат ответа /analytics/summary/ (суммы приведены к базовой валюте)
export interface AnalyticsSummary {
  total: number;
  count: number;
  average: number;
  currency: string | null;
  unconverted_currencies: string[];
}

// Формат ответа /analytics/by-category/
export interface ExpensesByCategory {
  category__id: number;
  category__name: string;
  category__icon: string;
  category__color: string;
  total: number;
  count: number;
  avg: number;
}

// Формат ответа /analytics/trends/
export interface ExpensesTrend {
  date: string;
  total: number;
  count: number;
}
