"""
Expense admin configuration.
"""
from django.contrib import admin
from .models import Expense, RecurringExpense


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    """
    Admin interface for expenses.
    """
    list_display = (
        'date', 'amount', 'currency', 'category', 'user',
        'payment_method', 'is_verified', 'created_at'
    )
    list_filter = (
        'is_verified', 'payment_method', 'date', 'category', 'currency'
    )
    search_fields = ('description', 'notes', 'location', 'user__email')
    ordering = ('-date', '-created_at')
    date_hierarchy = 'date'
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        (None, {
            'fields': ('user', 'amount', 'currency', 'category', 'date')
        }),
        ('Details', {
            'fields': ('description', 'notes', 'payment_method', 'location')
        }),
        ('Attachments', {
            'fields': ('receipt',)
        }),
        ('Organization', {
            'fields': ('tags', 'is_verified', 'recurring_expense')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'user', 'currency', 'category', 'recurring_expense'
        ).prefetch_related('tags')


@admin.register(RecurringExpense)
class RecurringExpenseAdmin(admin.ModelAdmin):
    """
    Admin interface for recurring expenses.
    """
    list_display = (
        'description', 'amount', 'currency', 'frequency',
        'next_date', 'is_active', 'auto_generate', 'user'
    )
    list_filter = ('is_active', 'auto_generate', 'frequency', 'currency')
    search_fields = ('description', 'notes', 'user__email')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        (None, {
            'fields': ('user', 'amount', 'currency', 'category')
        }),
        ('Details', {
            'fields': ('description', 'notes', 'payment_method')
        }),
        ('Schedule', {
            'fields': ('frequency', 'start_date', 'end_date', 'next_date')
        }),
        ('Settings', {
            'fields': ('is_active', 'auto_generate')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'user', 'currency', 'category'
        )
