# Быстрый старт проекта Expense Tracker

## Шаг 1: Клонирование и настройка окружения

```bash
# Перейти в директорию проекта
cd expense_tracker/backend

# Создать виртуальное окружение
python -m venv venv

# Активировать виртуальное окружение
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Обновить pip
python -m pip install --upgrade pip
```

## Шаг 2: Установка зависимостей

```bash
# Установить все зависимости
pip install -r requirements.txt
```

## Шаг 3: Настройка базы данных

### Вариант А: Использовать PostgreSQL локально

1. Установить PostgreSQL (если не установлен)
2. Создать базу данных:

```bash
# Войти в psql
psql -U postgres

# Создать БД
CREATE DATABASE expense_tracker;
CREATE USER expense_user WITH PASSWORD 'your_password';
ALTER ROLE expense_user SET client_encoding TO 'utf8';
ALTER ROLE expense_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE expense_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE expense_tracker TO expense_user;
\q
```

3. Создать файл `.env`:

```bash
cp .env.example .env
```

4. Отредактировать `.env`:

```env
DEBUG=True
SECRET_KEY=your-secret-key-change-me-in-production
DB_NAME=expense_tracker
DB_USER=expense_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
REDIS_URL=redis://localhost:6379/1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Вариант B: Использовать Docker

```bash
# Вернуться в корень проекта
cd ..

# Запустить только PostgreSQL и Redis
docker-compose up -d db redis

# Вернуться в backend
cd backend
```

## Шаг 4: Миграции базы данных

```bash
# Создать миграции
python manage.py makemigrations

# Применить миграции
python manage.py migrate
```

## Шаг 5: Загрузка начальных данных

```bash
# Загрузить валюты
python manage.py loaddata fixtures/currencies.json

# Загрузить категории (опционально)
python manage.py loaddata fixtures/categories.json
```

## Шаг 6: Создание суперпользователя

```bash
python manage.py createsuperuser
# Введите email, пароль
```

## Шаг 7: Запуск сервера

```bash
# Запустить Django сервер
python manage.py runserver
```

Сервер будет доступен по адресу: http://localhost:8000

### Важные URL:
- **Admin панель**: http://localhost:8000/admin/
- **API документация (Swagger)**: http://localhost:8000/api/docs/
- **API документация (ReDoc)**: http://localhost:8000/api/redoc/
- **API Schema**: http://localhost:8000/api/schema/

## Шаг 8: Запуск Celery (опционально, в отдельных терминалах)

### Терминал 2: Celery Worker
```bash
cd backend
venv\Scripts\activate  # или source venv/bin/activate
celery -A expense_tracker worker --loglevel=info --pool=solo
```

### Терминал 3: Celery Beat
```bash
cd backend
venv\Scripts\activate  # или source venv/bin/activate
celery -A expense_tracker beat --loglevel=info
```

## Быстрый тест API

### 1. Регистрация пользователя

```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"testpass123\",\"password2\":\"testpass123\",\"first_name\":\"Test\",\"last_name\":\"User\"}"
```

### 2. Получение токена

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"testpass123\"}"
```

Скопируйте значение `access` токена из ответа.

### 3. Получение категорий

```bash
curl -X GET http://localhost:8000/api/categories/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Создание расхода

```bash
curl -X POST http://localhost:8000/api/expenses/expenses/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"amount\":\"100.50\",\"currency\":1,\"category\":1,\"date\":\"2024-01-15\",\"description\":\"Test expense\",\"payment_method\":\"cash\"}"
```

## Полный запуск с Docker

Если хотите запустить весь проект в Docker (не требует локальной установки PostgreSQL/Redis):

```bash
# В корне проекта
docker-compose up -d

# Применить миграции
docker-compose exec backend python manage.py migrate

# Создать суперпользователя
docker-compose exec backend python manage.py createsuperuser

# Загрузить фикстуры
docker-compose exec backend python manage.py loaddata fixtures/currencies.json

# Просмотр логов
docker-compose logs -f backend
```

## Остановка сервисов

### Локальная разработка
- `Ctrl+C` в терминале с runserver
- `Ctrl+C` в терминале с Celery

### Docker
```bash
docker-compose down
```

## Troubleshooting

### Проблема: "ModuleNotFoundError"
**Решение**: Убедитесь что виртуальное окружение активировано и зависимости установлены

### Проблема: "database does not exist"
**Решение**: Создайте базу данных PostgreSQL (см. Шаг 3)

### Проблема: "connection refused" для PostgreSQL
**Решение**: Убедитесь что PostgreSQL запущен и настройки в .env корректны

### Проблема: "connection refused" для Redis
**Решение**: 
- Установите и запустите Redis локально
- Или используйте Docker: `docker-compose up -d redis`

### Проблема: Celery не работает на Windows
**Решение**: Используйте флаг `--pool=solo`:
```bash
celery -A expense_tracker worker --loglevel=info --pool=solo
```

## Следующие шаги

1. Изучите API документацию: http://localhost:8000/api/docs/
2. Протестируйте эндпоинты через Swagger UI
3. Создайте тестовые данные через Admin панель
4. Начните разработку frontend

## Полезные команды

```bash
# Создать миграции
python manage.py makemigrations

# Применить миграции
python manage.py migrate

# Создать суперпользователя
python manage.py createsuperuser

# Запустить тесты
pytest

# Запустить тесты с покрытием
pytest --cov

# Собрать статические файлы
python manage.py collectstatic

# Запустить Django shell
python manage.py shell

# Создать дамп данных
python manage.py dumpdata app_name > fixture.json

# Загрузить данные
python manage.py loaddata fixture.json
```

## Поддержка

Если возникли проблемы:
1. Проверьте логи
2. Убедитесь что все зависимости установлены
3. Проверьте переменные окружения в .env
4. Посмотрите документацию в README.md

Удачи в разработке! 🚀
