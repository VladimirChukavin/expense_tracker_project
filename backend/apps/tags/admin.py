from django.contrib import admin
from .models import Tag


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'color', 'user', 'created_at')
    list_filter = ('created_at', 'user')
    search_fields = ('name', 'description', 'user__email')
    ordering = ('name',)

    fieldsets = (
        (None, {
            'fields': ('user', 'name', 'color')
        }),
        ('Details', {
            'fields': ('description',)
        }),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')
