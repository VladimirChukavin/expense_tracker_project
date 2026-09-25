"""
Tests for analytics: multi-currency conversion and summary format.
"""
import pytest
from datetime import date
from decimal import Decimal
from apps.currencies.models import Currency, ExchangeRate
from apps.categories.models import Category
from apps.expenses.models import Expense
from apps.analytics.services import AnalyticsService

pytestmark = pytest.mark.django_db


@pytest.fixture
def rub(db):
    return Currency.objects.create(code='RUB', name='Рубль', symbol='₽')


@pytest.fixture
def usd(db):
    return Currency.objects.create(code='USD', name='Доллар', symbol='$')


@pytest.fixture
def category(user):
    return Category.objects.create(user=user, name='Продукты')


class TestCurrencyConversion:
    def test_summary_converts_to_base_currency(self, user, category, rub, usd):
        ExchangeRate.objects.create(
            from_currency=usd, to_currency=rub, rate=Decimal('90'), date=date(2026, 9, 1)
        )
        Expense.objects.create(
            user=user, amount=Decimal('100'), currency=usd,
            category=category, date=date(2026, 9, 1),
        )
        # самый свежий расход в RUB → базовая валюта RUB
        Expense.objects.create(
            user=user, amount=Decimal('1000'), currency=rub,
            category=category, date=date(2026, 9, 2),
        )

        summary = AnalyticsService.get_summary(user)

        # 100 USD * 90 + 1000 RUB = 10000 RUB
        assert summary['total'] == 10000.0
        assert summary['count'] == 2
        assert summary['currency'] == 'RUB'
        assert summary['unconverted_currencies'] == []

    def test_unconverted_currency_excluded(self, user, category, rub, usd):
        """Валюта без курса (в любую сторону) не ломает итог, а попадает в unconverted."""
        eur = Currency.objects.create(code='EUR', name='Евро', symbol='€')
        ExchangeRate.objects.create(
            from_currency=usd, to_currency=rub, rate=Decimal('90'), date=date(2026, 9, 1)
        )
        Expense.objects.create(
            user=user, amount=Decimal('100'), currency=usd,
            category=category, date=date(2026, 9, 1),
        )
        Expense.objects.create(
            user=user, amount=Decimal('1000'), currency=rub,
            category=category, date=date(2026, 9, 2),
        )
        # для EUR нет курса ни в одну сторону
        Expense.objects.create(
            user=user, amount=Decimal('50'), currency=eur,
            category=category, date=date(2026, 9, 3),
        )

        summary = AnalyticsService.get_summary(user)

        # базовая валюта — EUR (самый свежий расход), но курса EUR нет ни в
        # одну сторону, поэтому остальные валюты идут в unconverted
        assert summary['currency'] == 'EUR'
        assert summary['total'] == 50.0
        assert summary['count'] == 1
        assert summary['unconverted_currencies'] == ['RUB', 'USD']

    def test_reverse_rate_used_when_no_direct(self, user, category, rub, usd):
        """Если есть только RUB->USD, курс USD->RUB считается как 1/rate."""
        ExchangeRate.objects.create(
            from_currency=rub, to_currency=usd, rate=Decimal('0.01'), date=date(2026, 9, 1)
        )
        Expense.objects.create(
            user=user, amount=Decimal('200'), currency=usd,
            category=category, date=date(2026, 9, 1),
        )
        Expense.objects.create(
            user=user, amount=Decimal('10000'), currency=rub,
            category=category, date=date(2026, 9, 2),
        )

        summary = AnalyticsService.get_summary(user)  # base = RUB

        # 200 USD / 0.01 = 20000 RUB + 10000 RUB
        assert summary['total'] == 30000.0
        assert summary['unconverted_currencies'] == []

    def test_summary_filters_by_currency(self, user, category, rub, usd):
        Expense.objects.create(
            user=user, amount=Decimal('1000'), currency=rub,
            category=category, date=date(2026, 9, 1),
        )
        Expense.objects.create(
            user=user, amount=Decimal('100'), currency=usd,
            category=category, date=date(2026, 9, 2),
        )

        summary = AnalyticsService.get_summary(user, currency=rub)

        assert summary['total'] == 1000.0
        assert summary['count'] == 1

    def test_empty_summary(self, user, rub):
        summary = AnalyticsService.get_summary(user)

        assert summary == {
            'total': 0.0,
            'count': 0,
            'average': 0.0,
            'currency': None,
            'unconverted_currencies': [],
        }

    def test_by_category_aggregates_in_base_currency(self, user, category, rub, usd):
        cat = Category.objects.create(user=user, name='Кафе')
        ExchangeRate.objects.create(
            from_currency=usd, to_currency=rub, rate=Decimal('90'), date=date(2026, 9, 1)
        )
        Expense.objects.create(
            user=user, amount=Decimal('100'), currency=usd,
            category=cat, date=date(2026, 9, 1),
        )
        # более свежий расход в RUB → базовая валюта RUB
        Expense.objects.create(
            user=user, amount=Decimal('1000'), currency=rub,
            category=category, date=date(2026, 9, 2),
        )

        rows = AnalyticsService.get_by_category(user)

        assert len(rows) == 2
        # Кафе: 100 USD * 90 = 9000 RUB — первая по сумме
        assert float(rows[0]['total']) == 9000.0
        assert rows[0]['category__name'] == 'Кафе'
        assert rows[0]['count'] == 1
        # Продукты: 1000 RUB без конвертации
        assert float(rows[1]['total']) == 1000.0
        assert rows[1]['category__name'] == 'Продукты'