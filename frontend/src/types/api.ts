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
  username: string;
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
    username: string;
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
  tags?: number[];
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

export interface AnalyticsSummary {
  total_expenses: string;
  expense_count: number;
  average_expense: string;
  period_start: string;
  period_end: string;
}

export interface ExpensesByCategory {
  category: number;
  category_name: string;
  category_color: string;
  total_amount: string;
  expense_count: number;
  percentage: number;
}

export interface ExpensesTrend {
  date: string;
  total_amount: string;
  expense_count: number;
}
