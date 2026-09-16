# Expense Tracker

Современное приложение для отслеживания расходов с аналитикой и бюджетированием.

## Технологический стек

### Backend
- **Python 3.12+**
- **Django 5.1+** - веб-фреймворк
- **Django REST Framework** - REST API
- **PostgreSQL** - основная база данных
- **Redis** - кеширование и очереди задач
- **Celery** - асинхронные задачи
- **JWT** - аутентификация

### Frontend (планируется)
- **React 18+** / **Vue 3+**
- **TypeScript**
- **Tailwind CSS**
- **Chart.js / Recharts** - графики и визуализация

### Инфраструктура
- **Docker & Docker Compose**
- **Nginx** (для production)

## Функциональность

### Основные возможности
- ✅ Регистрация и аутентификация пользователей
- ✅ Управление категориями расходов (с иерархией)
- ✅ Добавление, редактирование, удаление расходов
- ✅ Прикрепление чеков к расходам
- ✅ Теги для организации расходов
- ✅ Мультивалютная поддержка
- ✅ Конвертация валют
- ✅ Периодические расходы
- ✅ Бюджетирование с алертами
- ✅ Аналитика и статистика
- ✅ Фильтрация и поиск

### API Endpoints

#### Аутентификация
- `POST /api/auth/register/` - регистрация
- `POST /api/auth/login/` - вход (получение токена)
- `POST /api/auth/token/refresh/` - обновление токена
- `GET /api/auth/profile/` - профиль пользователя
- `PUT /api/auth/profile/` - обновление профиля
- `POST /api/auth/change-password/` - смена пароля
- `DELETE /api/auth/delete-account/` - удаление аккаунта

#### Категории
- `GET /api/categories/` - список категорий
- `POST /api/categories/` - создание категории
- `GET /api/categories/{id}/` - детали категории
- `PUT /api/categories/{id}/` - обновление
- `DELETE /api/categories/{id}/` - удаление
- `GET /api/categories/tree/` - иерархическое дерево
- `GET /api/categories/{id}/expenses/` - расходы по категории

#### Расходы
- `GET /api/expenses/` - список расходов
- `POST /api/expenses/` - создание расхода
- `GET /api/expenses/{id}/` - детали расхода
- `PUT /api/expenses/{id}/` - обновление
- `DELETE /api/expenses/{id}/` - удаление
- `GET /api/expenses/statistics/` - статистика
- `GET /api/expenses/trends/` - тренды
- `POST /api/expenses/{id}/verify/` - подтверждение расхода
- `POST /api/expenses/bulk_delete/` - массовое удаление

#### Периодические расходы
- `GET /api/recurring/` - список периодических расходов
- `POST /api/recurring/` - создание
- `GET /api/recurring/{id}/` - детали
- `PUT /api/recurring/{id}/` - обновление
- `DELETE /api/recurring/{id}/` - удаление
- `POST /api/recurring/{id}/generate/` - ручная генерация
- `POST /api/recurring/{id}/toggle_active/` - активация/деактивация

#### Бюджеты
- `GET /api/budgets/` - список бюджетов
- `POST /api/budgets/` - создание бюджета
- `GET /api/budgets/{id}/` - детали
- `PUT /api/budgets/{id}/` - обновление
- `DELETE /api/budgets/{id}/` - удаление
- `GET /api/budgets/alerts/` - бюджеты с алертами
- `GET /api/budgets/exceeded/` - превышенные бюджеты

#### Валюты
- `GET /api/currencies/` - список валют
- `GET /api/currencies/{id}/` - детали валюты
- `GET /api/rates/` - курсы валют
- `GET /api/rates/convert/` - конвертация валют

#### Теги
- `GET /api/tags/` - список тегов
- `POST /api/tags/` - создание тега
- `GET /api/tags/{id}/` - детали
- `PUT /api/tags/{id}/` - обновление
- `DELETE /api/tags/{id}/` - удаление

#### Аналитика
- `GET /api/analytics/summary/` - общая статистика
- `GET /api/analytics/by-category/` - по категориям
- `GET /api/analytics/by-period/` - по периодам
- `GET /api/analytics/trends/` - тренды
- `GET /api/analytics/top-expenses/` - топ расходов
- `GET /api/analytics/compare/` - сравнение периодов

## Установка и запуск

### Предварительные требования
- Python 3.12+
- PostgreSQL 14+
- Redis 7+
- Node.js 18+ (для frontend)

### Локальная разработка

1. **Клонирование репозитория**
```bash
git clone <repository-url>
cd expense_tracker
```

2. **Создание виртуального окружения**
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. **Установка зависимостей**
```bash
pip install -r requirements.txt
```

4. **Настройка переменных окружения**
```bash
cp .env.example .env
# Отредактируйте .env файл с вашими настройками
```

5. **Создание базы данных**
```bash
# Создайте базу данных PostgreSQL
createdb expense_tracker

# Или через psql
psql -U postgres
CREATE DATABASE expense_tracker;
\q
```

6. **Миграции**
```bash
python manage.py makemigrations
python manage.py migrate
```

7. **Создание суперпользователя**
```bash
python manage.py createsuperuser
```

8. **Загрузка начальных данных (опционально)**
```bash
python manage.py loaddata fixtures/currencies.json
python manage.py loaddata fixtures/categories.json
```

9. **Запуск сервера**
```bash
python manage.py runserver
```

10. **Запуск Celery (в отдельном терминале)**
```bash
# Worker
celery -A expense_tracker worker --loglevel=info

# Beat (scheduler)
celery -A expense_tracker beat --loglevel=info
```

### Запуск с Docker

1. **Запуск всех сервисов**
```bash
docker-compose up -d
```

2. **Миграции в Docker**
```bash
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

3. **Остановка сервисов**
```bash
docker-compose down
```

## Структура проекта

```
expense_tracker/
├── backend/
│   ├── expense_tracker/          # Основной проект Django
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── celery.py
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── users/               # Пользователи
│   │   ├── categories/          # Категории
│   │   ├── tags/                # Теги
│   │   ├── currencies/          # Валюты
│   │   ├── expenses/            # Расходы
│   │   ├── budgets/             # Бюджеты
│   │   └── analytics/           # Аналитика
│   ├── core/                    # Общие утилиты
│   ├── manage.py
│   └── requirements.txt
├── frontend/                    # Frontend (будет создан)
├── docker-compose.yml
└── README.md
```

## API Документация

После запуска сервера документация API доступна по адресам:
- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/
- **OpenAPI Schema**: http://localhost:8000/api/schema/

## Тестирование

```bash
# Запуск всех тестов
pytest

# С покрытием
pytest --cov

# Конкретное приложение
pytest apps/expenses/tests/
```

## Разработка

### Создание миграций
```bash
python manage.py makemigrations
python manage.py migrate
```

### Создание фикстур
```bash
python manage.py dumpdata app_name.ModelName --indent 2 > fixtures/file.json
```

### Загрузка фикстур
```bash
python manage.py loaddata fixtures/file.json
```

## Production деплой

### Чеклист для production
- [ ] Изменить `SECRET_KEY`
- [ ] Установить `DEBUG=False`
- [ ] Настроить `ALLOWED_HOSTS`
- [ ] Настроить HTTPS
- [ ] Настроить static/media файлы (S3, CDN)
- [ ] Настроить мониторинг (Sentry)
- [ ] Настроить логирование
- [ ] Настроить бэкапы базы данных
- [ ] Настроить firewall
- [ ] Настроить rate limiting

## Roadmap

### В разработке
- [ ] Frontend на React/Vue
- [ ] Экспорт данных (CSV, PDF)
- [ ] Email уведомления
- [ ] Push уведомления
- [ ] Импорт из банковских выписок
- [ ] Машинное обучение для категоризации
- [ ] Мобильное приложение

## Вклад в проект

Мы приветствуем вклад в проект! Пожалуйста:
1. Форкните репозиторий
2. Создайте feature branch
3. Сделайте commit изменений
4. Отправьте pull request

## Лицензия

MIT License

## Контакты

- Email: support@expensetracker.com
- GitHub: https://github.com/yourorg/expense-tracker
