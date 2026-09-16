# Expense Tracker - Техническая спецификация

## Архитектура проекта

### Backend (Django)

#### Модели данных

**User** (Кастомная модель)
- email (unique, используется как username)
- first_name
- last_name
- password (хешированный)
- is_active, is_staff, is_superuser
- date_joined, last_login

**Category** (Категории расходов)
- user (FK)
- name
- parent (FK self, nullable) - для иерархии
- icon
- color (HEX)
- description
- is_default (системные категории)
- order (для сортировки)
- created_at, updated_at

**Tag** (Теги)
- user (FK)
- name (unique per user)
- color (HEX)
- description
- created_at

**Currency** (Валюты)
- code (3 символа, unique)
- name
- symbol
- is_active
- created_at, updated_at

**ExchangeRate** (Курсы валют)
- from_currency (FK)
- to_currency (FK)
- rate (Decimal)
- date
- created_at, updated_at

**Expense** (Основная модель расходов)
- user (FK)
- amount (Decimal)
- currency (FK)
- category (FK)
- date
- description
- notes
- payment_method (choices)
- location
- receipt (ImageField)
- tags (M2M)
- recurring_expense (FK, nullable)
- is_verified
- created_at, updated_at

**RecurringExpense** (Периодические расходы)
- user (FK)
- amount (Decimal)
- currency (FK)
- category (FK)
- description
- notes
- frequency (daily/weekly/monthly/yearly)
- start_date
- end_date (nullable)
- next_date
- payment_method
- is_active
- auto_generate
- created_at, updated_at

**Budget** (Бюджеты)
- user (FK)
- name
- amount (Decimal)
- currency (FK)
- period (daily/weekly/monthly/yearly/custom)
- start_date
- end_date (nullable)
- category (FK, nullable) - для бюджета по категории
- alert_threshold (%)
- alert_enabled
- is_active
- created_at, updated_at

#### API Эндпоинты

Все эндпоинты требуют JWT аутентификацию (кроме register/login).

**Формат ответа:**
```json
{
  "data": {...},
  "error": false,
  "message": "Success"
}
```

**Пагинация:**
```json
{
  "count": 100,
  "next": "http://api/url?page=2",
  "previous": null,
  "results": [...]
}
```

#### Celery Tasks

**Периодические задачи:**
- `generate_recurring_expenses` - запускается ежедневно в 00:00
- `check_budget_alerts` - каждый час
- `cleanup_old_data` - еженедельно

### Frontend (React/Vue)

#### Структура страниц

1. **Аутентификация**
   - /login
   - /register
   - /forgot-password

2. **Dashboard**
   - / - главная с основной статистикой
   - Виджеты: баланс, расходы за месяц, топ категории, графики

3. **Расходы**
   - /expenses - список всех расходов
   - /expenses/add - добавление расхода
   - /expenses/:id - детали/редактирование

4. **Категории**
   - /categories - управление категориями
   - Drag-and-drop для иерархии

5. **Бюджеты**
   - /budgets - список бюджетов
   - /budgets/add - создание бюджета
   - /budgets/:id - детали

6. **Аналитика**
   - /analytics - детальная аналитика
   - Графики, таблицы, экспорт

7. **Настройки**
   - /settings/profile
   - /settings/currencies
   - /settings/preferences

#### Компоненты

**Общие:**
- Layout (Header, Sidebar, Footer)
- Button, Input, Select, DatePicker
- Modal, Dropdown, Tooltip
- Table, Pagination
- Charts (Line, Bar, Pie, Donut)
- LoadingSpinner, ErrorBoundary

**Специфичные:**
- ExpenseCard, ExpenseList, ExpenseForm
- CategoryTree, CategorySelector
- BudgetCard, BudgetProgress
- AnalyticsChart, StatCard
- ReceiptUpload, ReceiptViewer

#### State Management

**Redux/Vuex структура:**
```
store/
├── auth/
│   ├── actions
│   ├── reducers
│   └── selectors
├── expenses/
├── categories/
├── budgets/
├── analytics/
└── ui/
```

### База данных

**PostgreSQL схема:**
- Все таблицы с индексами на FK
- Индексы на date полях для быстрой фильтрации
- Full-text search на description/notes

**Оптимизации:**
- select_related() для FK
- prefetch_related() для M2M
- Redis кеширование для статистики
- Database indexes для частых запросов

### Безопасность

1. **Аутентификация:**
   - JWT токены (access + refresh)
   - HTTPS only в production
   - CORS настроен

2. **Авторизация:**
   - Все объекты привязаны к user
   - IsOwner permission для всех эндпоинтов
   - Нет доступа к чужим данным

3. **Валидация:**
   - Django валидаторы
   - DRF serializers
   - Frontend валидация

4. **XSS/CSRF:**
   - Django CSRF защита
   - Sanitization пользовательского ввода

### Производительность

1. **Кеширование:**
   - Redis для сессий
   - Redis для статистики
   - Browser caching для статики

2. **Оптимизация запросов:**
   - Pagination везде
   - Select/prefetch related
   - Database indexes

3. **Асинхронность:**
   - Celery для тяжелых задач
   - Email отправка в фоне

### Мониторинг и логирование

1. **Логи:**
   - Django logging в файлы
   - Celery логи
   - Nginx access/error logs

2. **Мониторинг:**
   - Sentry для ошибок
   - Prometheus + Grafana (опционально)

### Деплой

**Production stack:**
- Gunicorn + Nginx
- PostgreSQL
- Redis
- Celery workers
- Docker containers
- SSL сертификаты

**CI/CD:**
- GitHub Actions
- Автотесты
- Auto deploy на staging

## Стек технологий - итоговый

### Backend
- Python 3.12+
- Django 5.1+
- Django REST Framework
- PostgreSQL 14+
- Redis 7+
- Celery
- JWT Authentication
- drf-spectacular (OpenAPI)

### Frontend (на выбор)
- React 18+ или Vue 3+
- TypeScript
- Tailwind CSS
- Chart.js/Recharts
- Axios
- React Query/Vue Query

### DevOps
- Docker & Docker Compose
- Nginx
- Gunicorn
- GitHub Actions

### Дополнительно
- pytest для тестов
- Black для форматирования
- Ruff для линтинга
- Pre-commit hooks
