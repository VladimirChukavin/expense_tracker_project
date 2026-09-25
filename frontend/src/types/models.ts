// Модели данных приложения

export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  date_joined?: string;
}

export interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  is_active: boolean;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  parent?: number;
  user: number;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: number;
  name: string;
  user: number;
  created_at: string;
}

// Формат ответа ExpenseListSerializer (list) и ExpenseSerializer (detail)
export interface Expense {
  id: number;
  amount: string;
  description?: string;
  date: string;
  category: number;
  category_name?: string;
  category_icon?: string;
  category_color?: string;
  currency: number;
  currency_code?: string;
  tags?: number[];
  tag_names?: string[];
  receipt?: string | null;
  user: number;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: number;
  name: string;
  amount: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  start_date: string;
  end_date?: string | null;
  category?: number;
  currency_code?: string;
  spent_amount?: number;
  remaining_amount?: number;
  spent_percentage?: number;
  is_exceeded?: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BudgetAlert {
  id: number;
  budget: number;
  threshold: number;
  is_triggered: boolean;
  triggered_at?: string;
  created_at: string;
}

export interface RecurringExpense {
  id: number;
  amount: string;
  description?: string;
  category: number;
  currency: number;
  tags: number[];
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date?: string;
  next_occurrence: string;
  is_active: boolean;
  user: number;
  created_at: string;
  updated_at: string;
}
