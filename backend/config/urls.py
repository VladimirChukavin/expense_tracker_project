"""
URL configuration for expense tracker project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),

    # API documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # API endpoints
    path('api/auth/', include('apps.users.urls')),
    path('api/expenses/', include('apps.expenses.urls')),
    path('api/categories/', include('apps.categories.urls')),
    path('api/tags/', include('apps.tags.urls')),
    path('api/currencies/', include('apps.currencies.urls')),
    path('api/recurring/', include('apps.recurring.urls')),
    path('api/budgets/', include('apps.budgets.urls')),
    path('api/sharing/', include('apps.sharing.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/import-export/', include('apps.import_export.urls')),
]

# Media files в development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

    # Debug toolbar
    if 'debug_toolbar' in settings.INSTALLED_APPS:
        urlpatterns = [path('__debug__/', include('debug_toolbar.urls'))] + urlpatterns

# Admin customization
admin.site.site_header = 'Expense Tracker Administration'
admin.site.site_title = 'Expense Tracker Admin'
admin.site.index_title = 'Welcome to Expense Tracker Admin Panel'
