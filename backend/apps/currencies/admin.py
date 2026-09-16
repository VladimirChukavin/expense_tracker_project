"""
Currency admin configuration.
"""
from django.contrib import admin
from .models import Currency, ExchangeRate


@admin.register(Currency)
class CurrencyAdmin(admin.ModelAdmin):
    """
    Admin interface for currencies.
    """
    list_display = ('code', 'name', 'symbol', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('code', 'name')
    ordering = ('code',)


@admin.register(ExchangeRate)
class ExchangeRateAdmin(admin.ModelAdmin):
    """
    Admin interface for exchange rates.
    """
    list_display = ('from_currency', 'to_currency', 'rate', 'date', 'created_at')
    list_filter = ('date', 'from_currency', 'to_currency')
    search_fields = ('from_currency__code', 'to_currency__code')
    ordering = ('-date',)
    date_hierarchy = 'date'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('from_currency', 'to_currency')
