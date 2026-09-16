# API Examples

## Аутентификация

### Регистрация
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123",
    "password2": "securepass123",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

### Вход (получение токена)
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123"
  }'
```

Ответ:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Обновление токена
```bash
curl -X POST http://localhost:8000/api/auth/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }'
```

### Получение профиля
```bash
curl -X GET http://localhost:8000/api/auth/profile/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..."
```

## Категории

### Получение списка категорий
```bash
curl -X GET http://localhost:8000/api/categories/ \
  -H "Authorization: Bearer <token>"
```

### Создание категории
```bash
curl -X POST http://localhost:8000/api/categories/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Продукты",
    "icon": "🛒",
    "color": "#4CAF50",
    "description": "Покупки в магазинах"
  }'
```

### Получение дерева категорий
```bash
curl -X GET http://localhost:8000/api/categories/tree/ \
  -H "Authorization: Bearer <token>"
```

## Расходы

### Создание расхода
```bash
curl -X POST http://localhost:8000/api/expenses/expenses/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "150.50",
    "currency": 1,
    "category": 1,
    "date": "2024-01-15",
    "description": "Покупки в супермаркете",
    "payment_method": "card"
  }'
```

### Получение списка расходов с фильтрами
```bash
curl -X GET "http://localhost:8000/api/expenses/expenses/?date_from=2024-01-01&date_to=2024-01-31&category=1" \
  -H "Authorization: Bearer <token>"
```

### Получение статистики
```bash
curl -X GET "http://localhost:8000/api/expenses/expenses/statistics/?date_from=2024-01-01&date_to=2024-01-31" \
  -H "Authorization: Bearer <token>"
```

## Бюджеты

### Создание бюджета
```bash
curl -X POST http://localhost:8000/api/budgets/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Месячный бюджет",
    "amount": "50000",
    "currency": 1,
    "period": "monthly",
    "start_date": "2024-01-01",
    "alert_threshold": 80,
    "alert_enabled": true
  }'
```

### Получение бюджетов с алертами
```bash
curl -X GET http://localhost:8000/api/budgets/alerts/ \
  -H "Authorization: Bearer <token>"
```

## Аналитика

### Получение общей статистики
```bash
curl -X GET "http://localhost:8000/api/analytics/summary/?start_date=2024-01-01&end_date=2024-01-31" \
  -H "Authorization: Bearer <token>"
```

### Статистика по категориям
```bash
curl -X GET "http://localhost:8000/api/analytics/by-category/?start_date=2024-01-01&end_date=2024-01-31" \
  -H "Authorization: Bearer <token>"
```

### Тренды за последние 30 дней
```bash
curl -X GET "http://localhost:8000/api/analytics/trends/?days=30" \
  -H "Authorization: Bearer <token>"
```

### Сравнение периодов
```bash
curl -X GET "http://localhost:8000/api/analytics/compare/?current_start=2024-01-01&current_end=2024-01-31&previous_start=2023-12-01&previous_end=2023-12-31" \
  -H "Authorization: Bearer <token>"
```

## Валюты

### Получение списка валют
```bash
curl -X GET http://localhost:8000/api/currencies/ \
  -H "Authorization: Bearer <token>"
```

### Конвертация валют
```bash
curl -X GET "http://localhost:8000/api/rates/convert/?from=USD&to=EUR&amount=100" \
  -H "Authorization: Bearer <token>"
```

## Периодические расходы

### Создание периодического расхода
```bash
curl -X POST http://localhost:8000/api/recurring/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "1000",
    "currency": 1,
    "category": 1,
    "description": "Аренда квартиры",
    "frequency": "monthly",
    "start_date": "2024-01-01",
    "payment_method": "bank_transfer",
    "auto_generate": true
  }'
```

### Ручная генерация расхода
```bash
curl -X POST http://localhost:8000/api/recurring/1/generate/ \
  -H "Authorization: Bearer <token>"
```
