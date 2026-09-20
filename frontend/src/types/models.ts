// Модели данных приложения

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  default_currency: number;
  created_at: string;
  updated_at: string;
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

export interface Expense {
  id: number;
  amount: string;
  description?: string;
  date: string;
  category: number;
  currency: number;
  tags: number[];
  receipt?: string;
  user: number;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: number;
  name: string;
  amount: string;
  spent: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date: string;
  category?: number;
  user: number;
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
