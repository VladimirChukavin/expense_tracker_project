"""
Expense filters.
"""
import django_filters
from .models import Expense


class ExpenseFilter(django_filters.FilterSet):
    """
    Filter class for expenses.
    """
    date_from = django_filters.DateFilter(field_name='date', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='date', lookup_expr='lte')
    amount_min = django_filters.NumberFilter(field_name='amount', lookup_expr='gte')
    amount_max = django_filters.NumberFilter(field_name='amount', lookup_expr='lte')
    category = django_filters.NumberFilter(field_name='category__id')
    tags = django_filters.CharFilter(method='filter_tags')
    payment_method = django_filters.CharFilter(field_name='payment_method')
    is_verified = django_filters.BooleanFilter(field_name='is_verified')

    class Meta:
        model = Expense
        fields = [
            'date_from', 'date_to', 'amount_min', 'amount_max',
            'category', 'tags', 'payment_method', 'is_verified'
        ]

    def filter_tags(self, queryset, name, value):
        """Filter by tag names (comma-separated)."""
        if value:
            tag_names = [tag.strip() for tag in value.split(',')]
            return queryset.filter(tags__name__in=tag_names).distinct()
        return queryset
