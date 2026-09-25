from django.contrib import admin
from .models import Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'parent', 'icon', 'color', 'is_default', 'order', 'created_at')
    list_filter = ('is_default', 'created_at', 'user')
    search_fields = ('name', 'description', 'user__email')
    ordering = ('order', 'name')
    list_editable = ('order',)

    fieldsets = (
        (None, {
            'fields': ('user', 'name', 'parent')
        }),
        ('Appearance', {
            'fields': ('icon', 'color', 'description')
        }),
        ('Settings', {
            'fields': ('is_default', 'order')
        }),
    )

    def get_queryset(self, request):
        """Filter by parent to show hierarchy."""
        return super().get_queryset(request).select_related('user', 'parent')
