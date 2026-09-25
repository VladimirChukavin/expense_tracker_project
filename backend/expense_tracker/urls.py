from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView
)

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/auth/', include('apps.users.urls')),
    path('api/categories/', include('apps.categories.urls')),
    path('api/tags/', include('apps.tags.urls')),
    path('api/', include('apps.currencies.urls')),
    path('api/', include('apps.expenses.urls')),
    path('api/budgets/', include('apps.budgets.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
]

if settings.DEBUG:
    urlpatterns += [
        path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
        path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
        path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    ]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

admin.site.site_header = 'Expense Tracker Admin'
admin.site.site_title = 'Expense Tracker'
admin.site.index_title = 'Welcome to Expense Tracker Administration'
