export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login/',
    REGISTER: '/auth/register/',
    LOGOUT: '/auth/logout/',
    REFRESH: '/auth/token/refresh/',
    ME: '/auth/me/',
  },
  EXPENSES: {
    LIST: '/expenses/',
    CREATE: '/expenses/',
    DETAIL: (id: number) => `/expenses/${id}/`,
    UPDATE: (id: number) => `/expenses/${id}/`,
    DELETE: (id: number) => `/expenses/${id}/`,
  },
  CATEGORIES: {
    LIST: '/categories/',
    CREATE: '/categories/',
    TREE: '/categories/tree/',
    DETAIL: (id: number) => `/categories/${id}/`,
    UPDATE: (id: number) => `/categories/${id}/`,
    DELETE: (id: number) => `/categories/${id}/`,
  },
  TAGS: {
    LIST: '/tags/',
    CREATE: '/tags/',
    DETAIL: (id: number) => `/tags/${id}/`,
    UPDATE: (id: number) => `/tags/${id}/`,
    DELETE: (id: number) => `/tags/${id}/`,
  },
  BUDGETS: {
    LIST: '/budgets/',
    CREATE: '/budgets/',
    DETAIL: (id: number) => `/budgets/${id}/`,
    UPDATE: (id: number) => `/budgets/${id}/`,
    DELETE: (id: number) => `/budgets/${id}/`,
    ALERTS: '/budgets/alerts/',
    EXCEEDED: '/budgets/exceeded/',
  },
  CURRENCIES: {
    LIST: '/currencies/',
  },
  ANALYTICS: {
    SUMMARY: '/analytics/summary/',
    BY_CATEGORY: '/analytics/by-category/',
    TRENDS: '/analytics/trends/',
  },
};

export const BUDGET_PERIODS = [
  { value: 'daily', label: 'Ежедневно' },
  { value: 'weekly', label: 'Еженедельно' },
  { value: 'monthly', label: 'Ежемесячно' },
  { value: 'yearly', label: 'Ежегодно' },
] as const;

export const RECURRING_FREQUENCIES = [
  { value: 'daily', label: 'Ежедневно' },
  { value: 'weekly', label: 'Еженедельно' },
  { value: 'monthly', label: 'Ежемесячно' },
  { value: 'yearly', label: 'Ежегодно' },
] as const;

export const DEFAULT_PAGE_SIZE = 20;

export const CATEGORY_COLORS = [
  '#EF4444', // red
  '#F59E0B', // amber
  '#10B981', // green
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#6366F1', // indigo
  '#14B8A6', // teal
  '#F97316', // orange
  '#06B6D4', // cyan
];

export const BUDGET_THRESHOLD_COLORS = {
  safe: '#10B981',    // green
  warning: '#F59E0B', // yellow
  danger: '#EF4444',  // red
} as const;

export const DATE_FORMAT = 'dd.MM.yyyy';
export const DATETIME_FORMAT = 'dd.MM.yyyy HH:mm';
