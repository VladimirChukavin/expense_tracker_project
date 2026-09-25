"""
Tests for RecurringExpense.generate_next_expense date math.
"""
import pytest
from datetime import date
from decimal import Decimal
from apps.currencies.models import Currency
from apps.categories.models import Category
from apps.expenses.models import RecurringExpense

pytestmark = pytest.mark.django_db


@pytest.fixture
def currency(db):
    return Currency.objects.create(code='RUB', name='Рубль', symbol='₽')


@pytest.fixture
def category(user):
    return Category.objects.create(user=user, name='Подписки')


def make_recurring(user, category, currency, next_date, frequency='monthly'):
    return RecurringExpense.objects.create(
        user=user,
        amount=Decimal('500.00'),
        currency=currency,
        category=category,
        description='Netflix',
        frequency=frequency,
        start_date=next_date,
        next_date=next_date,
    )


class TestGenerateNextExpense:
    def test_monthly_from_december_rolls_year(self, user, category, currency):
        """31 декабря + 1 месяц = 31 января следующего года (не ValueError)."""
        recurring = make_recurring(
            user, category, currency, date(2026, 12, 31), frequency='monthly'
        )

        expense = recurring.generate_next_expense()

        assert expense is not None
        assert recurring.next_date == date(2027, 1, 31)

    def test_monthly_day_31_clamps_to_month_end(self, user, category, currency):
        """31 января + 1 месяц = 28 февраля (клэмп по длине месяца)."""
        recurring = make_recurring(
            user, category, currency, date(2026, 1, 31), frequency='monthly'
        )

        recurring.generate_next_expense()

        assert recurring.next_date == date(2026, 2, 28)

    def test_yearly_from_feb_29(self, user, category, currency):
        """29 февраля + 1 год = 28 февраля следующего (невисокосного) года."""
        recurring = make_recurring(
            user, category, currency, date(2028, 2, 29), frequency='yearly'
        )

        recurring.generate_next_expense()

        assert recurring.next_date == date(2029, 2, 28)

    def test_daily_and_weekly(self, user, category, currency):
        daily = make_recurring(
            user, category, currency, date(2026, 9, 24), frequency='daily'
        )
        weekly = make_recurring(
            user, category, currency, date(2026, 9, 24), frequency='weekly'
        )

        daily.generate_next_expense()
        weekly.generate_next_expense()

        assert daily.next_date == date(2026, 9, 25)
        assert weekly.next_date == date(2026, 10, 1)

    def test_creates_expense_with_recurring_link(self, user, category, currency):
        recurring = make_recurring(
            user, category, currency, date(2026, 9, 24), frequency='monthly'
        )

        expense = recurring.generate_next_expense()

        assert expense.recurring_expense == recurring
        assert expense.user == user
        assert expense.date == date(2026, 9, 24)
        assert recurring.next_date == date(2026, 10, 24)

    def test_deactivates_after_end_date(self, user, category, currency):
        recurring = make_recurring(
            user, category, currency, date(2026, 9, 24), frequency='monthly'
        )
        recurring.end_date = date(2026, 9, 23)
        recurring.save()

        expense = recurring.generate_next_expense()

        assert expense is None
        recurring.refresh_from_db()
        assert recurring.is_active is False

    def test_inactive_returns_none(self, user, category, currency):
        recurring = make_recurring(
            user, category, currency, date(2026, 9, 24), frequency='monthly'
        )
        recurring.is_active = False
        recurring.save()

        assert recurring.generate_next_expense() is None
