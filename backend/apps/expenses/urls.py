from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExpenseViewSet, RecurringExpenseViewSet

app_name = 'expenses'

router = DefaultRouter()
router.register(r'expenses', ExpenseViewSet, basename='expense')
router.register(r'recurring', RecurringExpenseViewSet, basename='recurring-expense')

urlpatterns = [
    path('', include(router.urls)),
]
