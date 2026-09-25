from django.contrib import admin
from .models import Budget


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'amount', 'currency', 'period',
        'start_date', 'end_date', 'is_active', 'user'
    )
    list_filter = ('is_active', 'period', 'currency', 'alert_enabled')
    search_fields = ('name', 'user__email')
    ordering = ('-created_at',)
    date_hierarchy = 'start_date'

    fieldsets = (
        (None, {
            'fields': ('user', 'name', 'amount', 'currency')
        }),
        ('Period', {
            'fields': ('period', 'start_date', 'end_date')
        }),
        ('Category Filter', {
            'fields': ('category',)
        }),
        ('Alerts', {
            'fields': ('alert_threshold', 'alert_enabled')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'currency', 'category')
