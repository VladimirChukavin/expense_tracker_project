# Expense Tracker Frontend

React + TypeScript приложение для отслеживания расходов с аналитикой и бюджетированием.

## Технологии

- **React 18** + **TypeScript** — основа приложения
- **Vite** — сборка и dev сервер
- **Tailwind CSS** — стилизация
- **shadcn/ui** — компоненты UI (Radix UI + Tailwind)
- **React Router v6** — маршрутизация
- **Zustand** — state management
- **React Query** — управление серверным состоянием
- **Axios** — HTTP клиент
- **Recharts** — графики
- **React Hook Form** + **Zod** — формы и валидация
- **date-fns** — работа с датами
- **react-hot-toast** — уведомления

## Установка и запуск

```bash
# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev

# Сборка для production
npm run build

# Preview production сборки
npm run preview

# Линтинг
npm run lint
```

## Переменные окружения

Создайте файл `.env.local`:

```env
VITE_API_URL=http://localhost:8000/api
```

## Структура проекта

```
src/
├── components/          # Переиспользуемые компоненты
│   ├── ui/             # shadcn/ui компоненты
│   ├── layout/         # Layout компоненты (Header, Sidebar)
│   ├── charts/         # Компоненты графиков (Recharts)
│   └── common/         # Общие компоненты
├── features/           # Функциональные модули
│   ├── auth/          # Аутентификация
│   ├── expenses/      # Управление расходами
│   ├── categories/    # Категории
│   ├── budgets/       # Бюджеты
│   └── analytics/     # Аналитика и дашборд
├── lib/               # Утилиты и конфигурация
│   ├── api/          # API клиент и interceptors
│   ├── formatters.ts # Форматирование данных
│   ├── constants.ts  # Константы приложения
│   └── utils.ts      # Вспомогательные функции
├── stores/           # Zustand stores
├── hooks/            # Custom hooks
├── routes/           # Routing
├── types/            # TypeScript типы
├── App.tsx           # Root component
├── main.tsx          # Entry point
└── index.css         # Global styles
```

## Основные модули

### Auth
- JWT аутентификация с автоматическим refresh токена
- Защищенные маршруты
- Формы входа и регистрации с валидацией

### Expenses
- CRUD операции с расходами
- Фильтрация по дате, категории, сумме
- Загрузка чеков с preview
- Пагинация

### Categories
- Иерархическое дерево категорий
- Два режима отображения: дерево и список
- Выбор цвета и иконки
- Родительские и дочерние категории

### Budgets
- Создание бюджетов на разные периоды (день/неделя/месяц/год)
- Прогресс бар с цветовой индикацией
- Алерты при превышении бюджета
- Бюджеты для всех расходов или конкретной категории

### Analytics
- Dashboard с виджетами статистики
- Графики: круговая диаграмма по категориям, линейный график трендов
- Топ-10 расходов
- Фильтрация по периодам

## API интеграция

Backend API: Django REST Framework на `http://localhost:8000/api`

Все запросы автоматически получают JWT токен через interceptors.

## Разработка

### Добавление нового компонента shadcn/ui

```bash
npx shadcn@latest add [component-name]
```

### Создание нового модуля

1. Создайте структуру в `features/[module-name]/`:
   - `api/` — API методы
   - `components/` — React компоненты
   - `hooks/` — React Query hooks
   - `pages/` — Страницы
2. Добавьте маршруты в `routes/AppRoutes.tsx`
3. Добавьте типы в `types/models.ts` и `types/api.ts`

## Production

```bash
npm run build
```

Результат сборки в папке `dist/`.

Для деплоя используйте любой static hosting (Netlify, Vercel, CloudFlare Pages).
