"""
Budget views.
"""
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from core.permissions import IsOwner
from .models import Budget
from .serializers import BudgetSerializer, BudgetListSerializer


class BudgetViewSet(viewsets.ModelViewSet):
    """
    API endpoint for budgets.
    """
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['period', 'is_active', 'category']
    search_fields = ['name']
    ordering_fields = ['name', 'amount', 'start_date', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filter budgets by authenticated user."""
        return Budget.objects.filter(user=self.request.user).select_related(
            'category', 'currency'
        )

    def get_serializer_class(self):
        """Use simplified serializer for list action."""
        if self.action == 'list':
            return BudgetListSerializer
        return BudgetSerializer

    @action(detail=False, methods=['get'])
    def alerts(self, request):
        """Get budgets that should trigger alerts."""
        budgets = self.get_queryset().filter(is_active=True, alert_enabled=True)
        alert_budgets = [b for b in budgets if b.should_alert()]

        serializer = BudgetSerializer(alert_budgets, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def exceeded(self, request):
        """Get exceeded budgets."""
        budgets = self.get_queryset().filter(is_active=True)
        exceeded_budgets = [b for b in budgets if b.is_exceeded()]

        serializer = BudgetSerializer(exceeded_budgets, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle active status of budget."""
        budget = self.get_object()
        budget.is_active = not budget.is_active
        budget.save(update_fields=['is_active'])

        return Response({
            'message': f'Budget {"activated" if budget.is_active else "deactivated"}',
            'is_active': budget.is_active
        })
