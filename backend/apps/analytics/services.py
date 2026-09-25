"""
Analytics service for expense insights.

Все агрегаты считаются в одной (базовой) валюте. Если параметр `currency`
не передан, базовой валютой становится валюта самого свежего расхода,
а суммы в остальных валютах конвертируются по последнему известному курсу
из таблицы ExchangeRate. Расходы в валютах без курса не попадают в общий
итог и перечисляются в `unconverted_currencies`.
"""
from django.db.models import Sum, Count
from django.db.models.functions import TruncDate, TruncWeek, TruncMonth, TruncYear
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from apps.expenses.models import Expense
from apps.currencies.models import ExchangeRate

ZERO = Decimal('0')


class AnalyticsService:
    @staticmethod
    def _get_expenses(user, start_date=None, end_date=None, currency=None):
        expenses = Expense.objects.filter(user=user)

        if start_date:
            expenses = expenses.filter(date__gte=start_date)
        if end_date:
            expenses = expenses.filter(date__lte=end_date)
        if currency:
            expenses = expenses.filter(currency=currency)

        return expenses

    @staticmethod
    def _base_currency_id(expenses):
        return (
            expenses.order_by('-date', '-created_at')
            .values_list('currency_id', flat=True)
            .first()
        )

    @staticmethod
    def _rate_map(expenses, base_currency_id):
        currency_ids = set(
            expenses.values_list('currency_id', flat=True).distinct()
        )
        rates = {base_currency_id: Decimal('1')}
        for cid in currency_ids - {base_currency_id}:
            rate = (
                ExchangeRate.objects.filter(
                    from_currency_id=cid,
                    to_currency_id=base_currency_id,
                )
                .order_by('-date')
                .first()
            )
            if rate:
                rates[cid] = rate.rate
                continue
            reverse = (
                ExchangeRate.objects.filter(
                    from_currency_id=base_currency_id,
                    to_currency_id=cid,
                )
                .order_by('-date')
                .first()
            )
            rates[cid] = (Decimal('1') / reverse.rate) if reverse and reverse.rate else None
        return rates

    @classmethod
    def _aggregate(cls, expenses, key_fields):
        base_id = cls._base_currency_id(expenses)
        if base_id is None:
            return [], [], None

        rates = cls._rate_map(expenses, base_id)

        group_fields = list(key_fields) + ['currency_id', 'currency__code']
        groups = list(
            expenses.values(*group_fields).annotate(
                total=Sum('amount'),
                count=Count('id'),
            )
        )

        merged = {}
        unconverted = set()
        for group in groups:
            rate = rates.get(group['currency_id'])
            if rate is None:
                unconverted.add(group['currency__code'])
                continue
            key = tuple(group[f] for f in key_fields)
            item = merged.setdefault(
                key,
                {
                    **{f: group[f] for f in key_fields},
                    'total': ZERO,
                    'count': 0,
                },
            )
            item['total'] += group['total'] * rate
            item['count'] += group['count']

        rows = list(merged.values())
        for row in rows:
            row['avg'] = (row['total'] / row['count']) if row['count'] else ZERO

        return rows, sorted(unconverted), base_id

    @classmethod
    def get_summary(cls, user, start_date=None, end_date=None, currency=None):
        expenses = cls._get_expenses(user, start_date, end_date, currency)
        rows, unconverted, base_id = cls._aggregate(expenses, [])
        if not rows:
            return {
                'total': 0.0,
                'count': 0,
                'average': 0.0,
                'currency': None,
                'unconverted_currencies': [],
            }

        row = rows[0]
        base_code = (
            expenses.filter(currency_id=base_id)
            .values_list('currency__code', flat=True)
            .first()
        )
        return {
            'total': float(row['total']),
            'count': row['count'],
            'average': float(row['avg']),
            'currency': base_code,
            'unconverted_currencies': unconverted,
        }

    @classmethod
    def get_by_category(cls, user, start_date=None, end_date=None, currency=None, limit=10):
        expenses = cls._get_expenses(user, start_date, end_date, currency)
        rows, unconverted, _ = cls._aggregate(
            expenses,
            ['category__id', 'category__name', 'category__icon', 'category__color'],
        )
        rows.sort(key=lambda r: r['total'], reverse=True)
        return rows[:limit]

    @classmethod
    def get_by_period(cls, user, period='day', start_date=None, end_date=None, currency=None):
        expenses = cls._get_expenses(user, start_date, end_date, currency)

        trunc_func = {
            'day': TruncDate,
            'week': TruncWeek,
            'month': TruncMonth,
            'year': TruncYear,
        }.get(period, TruncDate)

        expenses = expenses.annotate(period=trunc_func('date'))
        rows, unconverted, _ = cls._aggregate(expenses, ['period'])
        rows.sort(key=lambda r: r['period'])
        return rows

    @classmethod
    def get_trends(cls, user, days=30, currency=None):
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)

        expenses = cls._get_expenses(user, start_date, end_date, currency)
        rows, unconverted, _ = cls._aggregate(expenses, ['date'])

        date_dict = {row['date']: row for row in rows}

        result = []
        current_date = start_date
        while current_date <= end_date:
            if current_date in date_dict:
                result.append(date_dict[current_date])
            else:
                result.append({
                    'date': current_date,
                    'total': ZERO,
                    'count': 0,
                })
            current_date += timedelta(days=1)

        return result

    @classmethod
    def get_top_expenses(cls, user, start_date=None, end_date=None, limit=10):
        expenses = cls._get_expenses(user, start_date, end_date)
        base_id = cls._base_currency_id(expenses)
        if base_id is None:
            return []

        rates = cls._rate_map(expenses, base_id)

        top = []
        for expense in expenses.select_related('category', 'currency'):
            rate = rates.get(expense.currency_id)
            if rate is None:
                continue
            top.append((expense.amount * rate, expense))

        top.sort(key=lambda pair: pair[0], reverse=True)
        return [expense for _, expense in top[:limit]]

    @classmethod
    def compare_periods(cls, user, current_start, current_end, previous_start, previous_end, currency=None):
        current = cls.get_summary(user, current_start, current_end, currency)
        previous = cls.get_summary(user, previous_start, previous_end, currency)

        diff = current['total'] - previous['total']
        percent_change = 0
        if previous['total'] > 0:
            percent_change = (diff / previous['total']) * 100

        return {
            'current': current,
            'previous': previous,
            'difference': float(diff),
            'percent_change': round(percent_change, 2)
        }
