from django.urls import path
from .views import (
    AnalyticsSummaryView,
    AnalyticsByCategoryView,
    AnalyticsByPeriodView,
    AnalyticsTrendsView,
    AnalyticsTopExpensesView,
    AnalyticsCompareView
)

app_name = 'analytics'

urlpatterns = [
    path('summary/', AnalyticsSummaryView.as_view(), name='summary'),
    path('by-category/', AnalyticsByCategoryView.as_view(), name='by-category'),
    path('by-period/', AnalyticsByPeriodView.as_view(), name='by-period'),
    path('trends/', AnalyticsTrendsView.as_view(), name='trends'),
    path('top-expenses/', AnalyticsTopExpensesView.as_view(), name='top-expenses'),
    path('compare/', AnalyticsCompareView.as_view(), name='compare'),
]
