"""
Tests for the expenses API.
"""
import pytest
from decimal import Decimal
from apps.currencies.models import Currency
from apps.categories.models import Category
from apps.expenses.models import Expense

pytestmark = pytest.mark.django_db

EXPENSES_URL = '/api/expenses/'


@pytest.fixture
def currency(db):
    return Currency.objects.create(code='RUB', name='Рубль', symbol='₽')


@pytest.fixture
def category(user):
    return Category.objects.create(user=user, name='Продукты')


@pytest.fixture
def other_user(db):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    return User.objects.create_user(
        email='other@example.com', password='otherpass123'
    )


@pytest.fixture
def expense(user, category, currency):
    return Expense.objects.create(
        user=user,
        amount=Decimal('100.50'),
        currency=currency,
        category=category,
        date='2026-09-01',
        description='Groceries',
    )


class TestExpenseList:
    def test_requires_auth(self, api_client):
        response = api_client.get(EXPENSES_URL)
        assert response.status_code == 401

    def test_list_returns_paginated_results(self, authenticated_client, expense):
        response = authenticated_client.get(EXPENSES_URL)

        assert response.status_code == 200
        assert response.data['count'] == 1
        item = response.data['results'][0]
        assert item['amount'] == '100.50'
        assert item['currency_code'] == 'RUB'
        assert item['category_name'] == 'Продукты'
        assert item['tag_names'] == []

    def test_user_isolation(self, authenticated_client, other_user, expense):
        """The list must contain only the current user's expenses."""
        other_category = Category.objects.create(
            user=other_user, name='Другое'
        )
        Expense.objects.create(
            user=other_user,
            amount=Decimal('999'),
            currency=expense.currency,
            category=other_category,
            date='2026-09-02',
        )

        response = authenticated_client.get(EXPENSES_URL)

        assert response.status_code == 200
        assert response.data['count'] == 1
        assert response.data['results'][0]['description'] == 'Groceries'


class TestExpenseCreate:
    def test_create_expense(self, authenticated_client, category, currency):
        payload = {
            'amount': '250.50',
            'currency': currency.id,
            'category': category.id,
            'date': '2026-09-20',
            'description': 'Кофе',
        }

        response = authenticated_client.post(EXPENSES_URL, payload)

        assert response.status_code == 201
        assert Expense.objects.filter(description='Кофе').exists()

    def test_create_rejects_other_users_category(
        self, authenticated_client, other_user, currency
    ):
        foreign_category = Category.objects.create(user=other_user, name='Чужая')

        payload = {
            'amount': '100',
            'currency': currency.id,
            'category': foreign_category.id,
            'date': '2026-09-20',
        }

        response = authenticated_client.post(EXPENSES_URL, payload)

        assert response.status_code == 400
        # кастомный exception handler оборачивает ошибки валидации в details
        assert 'category' in response.data['details']

    def test_create_rejects_zero_amount(self, authenticated_client, category, currency):
        payload = {
            'amount': '0',
            'currency': currency.id,
            'category': category.id,
            'date': '2026-09-20',
        }

        response = authenticated_client.post(EXPENSES_URL, payload)

        assert response.status_code == 400


class TestBulkDelete:
    def test_bulk_delete_only_own_expenses(self, authenticated_client, other_user, expense):
        other_category = Category.objects.create(user=other_user, name='Другое')
        foreign = Expense.objects.create(
            user=other_user,
            amount=Decimal('1'),
            currency=expense.currency,
            category=other_category,
            date='2026-09-03',
        )

        response = authenticated_client.post(
            f'{EXPENSES_URL}bulk_delete/',
            {'ids': [expense.id, foreign.id]},
            format='json',
        )

        assert response.status_code == 200
        # чужой расход не удалён
        assert Expense.objects.filter(pk=foreign.pk).exists()
        assert not Expense.objects.filter(pk=expense.pk).exists()

    def test_bulk_delete_requires_ids(self, authenticated_client):
        response = authenticated_client.post(
            f'{EXPENSES_URL}bulk_delete/', {}, format='json'
        )
        assert response.status_code == 400