# Структура проекта Expense Tracker

```
expense_tracker/
│
├── backend/                                 # Django Backend
│   ├── expense_tracker/                     # Главный модуль проекта
│   │   ├── __init__.py                     # Инициализация Celery
│   │   ├── settings.py                     # Настройки Django
│   │   ├── urls.py                         # Главные URL маршруты
│   │   ├── wsgi.py                         # WSGI конфигурация
│   │   ├── asgi.py                         # ASGI конфигурация
│   │   └── celery.py                       # Конфигурация Celery
│   │
│   ├── apps/                               # Django приложения
│   │   │
│   │   ├── users/                          # Пользователи и аутентификация
│   │   │   ├── __init__.py
│   │   │   ├── admin.py                    # Admin для пользователей
│   │   │   ├── apps.py
│   │   │   ├── models.py                   # Кастомная модель User
│   │   │   ├── serializers.py              # Сериализаторы для User API
│   │   │   ├── urls.py                     # URL для auth endpoints
│   │   │   └── views.py                    # Views для регистрации/профиля
│   │   │
│   │   ├── categories/                     # Категории расходов
│   │   │   ├── __init__.py
│   │   │   ├── admin.py
│   │   │   ├── apps.py
│   │   │   ├── models.py                   # Category модель (с иерархией)
│   │   │   ├── serializers.py              # Сериализаторы категорий
│   │   │   ├── urls.py
│   │   │   └── views.py                    # CRUD + tree view
│   │   │
│   │   ├── tags/                           # Теги для организации
│   │   │   ├── __init__.py
│   │   │   ├── admin.py
│   │   │   ├── apps.py
│   │   │   ├── models.py                   # Tag модель
│   │   │   ├── serializers.py
│   │   │   ├── urls.py
│   │   │   └── views.py                    # CRUD для тегов
│   │   │
│   │   ├── currencies/                     # Валюты и курсы
│   │   │   ├── __init__.py
│   │   │   ├── admin.py
│   │   │   ├── apps.py
│   │   │   ├── models.py                   # Currency, ExchangeRate
│   │   │   ├── serializers.py
│   │   │   ├── urls.py
│   │   │   └── views.py                    # Read-only + конвертация
│   │   │
│   │   ├── expenses/                       # Основные расходы
│   │   │   ├── __init__.py
│   │   │   ├── admin.py
│   │   │   ├── apps.py
│   │   │   ├── models.py                   # Expense, RecurringExpense
│   │   │   ├── serializers.py              # Детальные сериализаторы
│   │   │   ├── views.py                    # CRUD + statistics + trends
│   │   │   ├── urls.py
│   │   │   ├── filters.py                  # Django-filters для поиска
│   │   │   └── tasks.py                    # Celery задачи
│   │   │
│   │   ├── budgets/                        # Бюджетирование
│   │   │   ├── __init__.py
│   │   │   ├── admin.py
│   │   │   ├── apps.py
│   │   │   ├── models.py                   # Budget модель с расчётами
│   │   │   ├── serializers.py
│   │   │   ├── urls.py
│   │   │   └── views.py                    # CRUD + alerts
│   │   │
│   │   └── analytics/                      # Аналитика и отчёты
│   │       ├── __init__.py
│   │       ├── apps.py
│   │       ├── services.py                 # Бизнес-логика аналитики
│   │       ├── urls.py
│   │       └── views.py                    # API views для статистики
│   │
│   ├── core/                               # Общие компоненты
│   │   ├── __init__.py
│   │   ├── apps.py
│   │   ├── models.py                       # Базовые абстрактные модели
│   │   ├── permissions.py                  # Кастомные permissions
│   │   ├── pagination.py                   # Pagination классы
│   │   └── exceptions.py                   # Exception handlers
│   │
│   ├── fixtures/                           # Начальные данные
│   │   ├── currencies.json                 # Популярные валюты
│   │   └── categories.json                 # Базовые категории
│   │
│   ├── media/                              # Загруженные файлы (receipts)
│   ├── staticfiles/                        # Собранные статические файлы
│   ├── logs/                               # Логи приложения
│   │
│   ├── manage.py                           # Django management script
│   ├── requirements.txt                    # Python зависимости
│   ├── pytest.ini                          # Конфигурация pytest
│   ├── conftest.py                         # Pytest fixtures
│   ├── Dockerfile                          # Docker образ для backend
│   ├── setup.sh                            # Скрипт настройки
│   ├── .env.example                        # Пример переменных окружения
│   └── .gitignore                          # Git ignore правила
│
├── frontend/                               # Frontend (будет создан)
│   ├── src/
│   │   ├── components/                     # React/Vue компоненты
│   │   ├── pages/                          # Страницы приложения
│   │   ├── store/                          # State management
│   │   ├── services/                       # API клиенты
│   │   ├── utils/                          # Утилиты
│   │   └── App.jsx                         # Главный компонент
│   ├── public/
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml                      # Docker Compose конфигурация
├── Makefile                                # Удобные команды
│
├── README.md                               # Основная документация
├── QUICKSTART.md                           # Быстрый старт
├── DEPLOYMENT.md                           # Инструкции по деплою
├── TECHNICAL_SPEC.md                       # Техническая спецификация
├── API_EXAMPLES.md                         # Примеры API запросов
└── PROJECT_STRUCTURE.md                    # Этот файл
```

## Описание ключевых модулей

### Backend Apps

#### 1. **users** - Управление пользователями
- Кастомная модель User с email вместо username
- JWT аутентификация (access + refresh tokens)
- Регистрация, логин, профиль, смена пароля
- Удаление аккаунта

#### 2. **categories** - Категории расходов
- Иерархическая структура (parent-child)
- Иконки и цвета для визуализации
- Системные (is_default) и пользовательские категории
- Сортировка (order field)
- API для получения дерева категорий

#### 3. **tags** - Теги
- Простая модель для маркировки расходов
- Уникальность по пользователю
- Цветовая маркировка

#### 4. **currencies** - Мультивалютность
- Справочник валют (USD, EUR, RUB, и т.д.)
- Курсы обмена валют
- API для конвертации между валютами
- Read-only для обычных пользователей

#### 5. **expenses** - Основной функционал
- Модель Expense - главная модель расходов
- Связь с категориями, валютами, тегами
- Загрузка чеков (ImageField)
- Фильтрация по датам, категориям, тегам
- Статистика и тренды
- Модель RecurringExpense - периодические расходы
- Celery задачи для автоматической генерации

#### 6. **budgets** - Бюджетирование
- Бюджеты на разные периоды (день, неделя, месяц, год)
- Бюджеты на всё или на конкретную категорию
- Расчёт потраченной суммы и остатка
- Алерты при достижении порога (threshold)
- API для получения превышенных бюджетов

#### 7. **analytics** - Аналитика
- Сервис-слой для бизнес-логики
- Общая статистика (total, count, average)
- Группировка по категориям
- Группировка по периодам (день, неделя, месяц)
- Тренды за N дней
- Сравнение периодов
- Топ расходов

### Core модуль

#### Абстрактные модели
- **TimeStampedModel** - created_at, updated_at
- **UserOwnedModel** - связь с пользователем

#### Permissions
- **IsOwner** - доступ только к своим объектам

#### Pagination
- StandardResultsSetPagination (20 items)
- LargeResultsSetPagination (50 items)

#### Exception Handler
- Кастомная обработка ошибок API
- Единый формат ответов с ошибками

## Модели данных (схема БД)

### Основные таблицы

```
users
├── id (PK)
├── email (unique)
├── password (hashed)
├── first_name
├── last_name
├── is_active
├── is_staff
├── date_joined
└── last_login

categories
├── id (PK)
├── user_id (FK -> users)
├── parent_id (FK -> categories, nullable)
├── name
├── icon
├── color
├── description
├── is_default
├── order
├── created_at
└── updated_at

tags
├── id (PK)
├── user_id (FK -> users)
├── name
├── color
├── description
└── created_at

currencies
├── id (PK)
├── code (unique)
├── name
├── symbol
├── is_active
├── created_at
└── updated_at

exchange_rates
├── id (PK)
├── from_currency_id (FK -> currencies)
├── to_currency_id (FK -> currencies)
├── rate
├── date
├── created_at
└── updated_at

expenses
├── id (PK)
├── user_id (FK -> users)
├── amount
├── currency_id (FK -> currencies)
├── category_id (FK -> categories)
├── date
├── description
├── notes
├── payment_method
├── location
├── receipt (file)
├── recurring_expense_id (FK -> recurring_expenses, nullable)
├── is_verified
├── created_at
└── updated_at

expenses_tags (M2M)
├── expense_id (FK -> expenses)
└── tag_id (FK -> tags)

recurring_expenses
├── id (PK)
├── user_id (FK -> users)
├── amount
├── currency_id (FK -> currencies)
├── category_id (FK -> categories)
├── description
├── notes
├── frequency
├── start_date
├── end_date (nullable)
├── next_date
├── payment_method
├── is_active
├── auto_generate
├── created_at
└── updated_at

budgets
├── id (PK)
├── user_id (FK -> users)
├── name
├── amount
├── currency_id (FK -> currencies)
├── period
├── start_date
├── end_date (nullable)
├── category_id (FK -> categories, nullable)
├── alert_threshold
├── alert_enabled
├── is_active
├── created_at
└── updated_at
```

## API Endpoints (кратко)

```
Auth:
POST   /api/auth/register/
POST   /api/auth/login/
POST   /api/auth/token/refresh/
GET    /api/auth/profile/
PUT    /api/auth/profile/
POST   /api/auth/change-password/
DELETE /api/auth/delete-account/

Categories:
GET    /api/categories/
POST   /api/categories/
GET    /api/categories/{id}/
PUT    /api/categories/{id}/
DELETE /api/categories/{id}/
GET    /api/categories/tree/
GET    /api/categories/{id}/expenses/

Tags:
GET    /api/tags/
POST   /api/tags/
GET    /api/tags/{id}/
PUT    /api/tags/{id}/
DELETE /api/tags/{id}/

Currencies:
GET    /api/currencies/
GET    /api/currencies/{id}/
GET    /api/rates/
GET    /api/rates/convert/

Expenses:
GET    /api/expenses/
POST   /api/expenses/
GET    /api/expenses/{id}/
PUT    /api/expenses/{id}/
DELETE /api/expenses/{id}/
GET    /api/expenses/statistics/
GET    /api/expenses/trends/
POST   /api/expenses/{id}/verify/
POST   /api/expenses/bulk_delete/

Recurring:
GET    /api/recurring/
POST   /api/recurring/
GET    /api/recurring/{id}/
PUT    /api/recurring/{id}/
DELETE /api/recurring/{id}/
POST   /api/recurring/{id}/generate/
POST   /api/recurring/{id}/toggle_active/

Budgets:
GET    /api/budgets/
POST   /api/budgets/
GET    /api/budgets/{id}/
PUT    /api/budgets/{id}/
DELETE /api/budgets/{id}/
GET    /api/budgets/alerts/
GET    /api/budgets/exceeded/

Analytics:
GET    /api/analytics/summary/
GET    /api/analytics/by-category/
GET    /api/analytics/by-period/
GET    /api/analytics/trends/
GET    /api/analytics/top-expenses/
GET    /api/analytics/compare/
```

## Технологии

### Backend Stack
- **Python 3.12+**
- **Django 5.1+** - веб-фреймворк
- **Django REST Framework** - REST API
- **PostgreSQL** - реляционная БД
- **Redis** - кеш и брокер сообщений
- **Celery** - фоновые задачи
- **JWT** - токен аутентификация
- **drf-spectacular** - OpenAPI документация

### DevOps
- **Docker** - контейнеризация
- **Docker Compose** - оркестрация контейнеров
- **Nginx** - веб-сервер (production)
- **Gunicorn** - WSGI сервер (production)
- **Supervisor** - управление процессами

### Testing
- **pytest** - тестирование
- **pytest-django** - Django integration
- **factory-boy** - фабрики для тестов

## Безопасность

- JWT токены с ротацией
- HTTPS в production
- CORS правильно настроен
- Все объекты изолированы по пользователям
- IsOwner permission на всех эндпоинтах
- Валидация данных на всех уровнях
- Хеширование паролей (Django)
- CSRF защита
- SQL injection защита (ORM)

## Производительность

- Select/Prefetch related для оптимизации запросов
- Database indexes на FK и date полях
- Redis кеширование для статистики
- Pagination везде
- Celery для тяжёлых операций
- Compressed static files

## Что дальше?

1. **Frontend разработка** - React/Vue интерфейс
2. **Экспорт данных** - CSV, PDF, Excel
3. **Email уведомления** - алерты по бюджетам
4. **Импорт из банков** - парсинг выписок
5. **Machine Learning** - автокатегоризация
6. **Мобильное приложение** - React Native
7. **Графики и визуализации** - улучшенная аналитика
8. **Совместный доступ** - семейные бюджеты
9. **Интеграция с банками** - Open Banking API
10. **Telegram бот** - быстрое добавление расходов
