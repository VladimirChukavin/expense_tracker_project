"""
Expense views.
"""
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from django.utils.dateparse import parse_date
from django_filters.rest_framework import DjangoFilterBackend
from core.permissions import IsOwner
from .models import Expense, RecurringExpense
from .serializers import (
    ExpenseSerializer,
    ExpenseListSerializer,
    RecurringExpenseSerializer
)
from .filters import ExpenseFilter


class ExpenseViewSet(viewsets.ModelViewSet):
    """
    API endpoint for expenses.
    """
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ExpenseFilter
    search_fields = ['description', 'notes', 'location']
    ordering_fields = ['date', 'amount', 'created_at']
    ordering = ['-date', '-created_at']

    def get_queryset(self):
        """Filter expenses by authenticated user."""
        return Expense.objects.filter(user=self.request.user).select_related(
            'category', 'currency', 'recurring_expense'
        ).prefetch_related('tags')

    def get_serializer_class(self):
        """Use simplified serializer for list action."""
        if self.action == 'list':
            return ExpenseListSerializer
        return ExpenseSerializer

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get expense statistics."""
        queryset = self.filter_queryset(self.get_queryset())

        total = queryset.aggregate(total=Sum('amount'))['total'] or 0
        count = queryset.count()
        avg = total / count if count > 0 else 0

        # Group by category
        by_category = queryset.values(
            'category__name', 'category__icon', 'category__color'
        ).annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('-total')

        # Group by payment method
        by_payment = queryset.values('payment_method').annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('-total')

        return Response({
            'total': float(total),
            'count': count,
            'average': float(avg),
            'by_category': list(by_category),
            'by_payment_method': list(by_payment)
        })

    @action(detail=False, methods=['get'])
    def trends(self, request):
        """Get expense trends over time."""
        queryset = self.filter_queryset(self.get_queryset())

        # Group by date
        by_date = queryset.values('date').annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('date')

        return Response({
            'data': list(by_date)
        })

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Mark expense as verified."""
        expense = self.get_object()
        expense.is_verified = True
        expense.save(update_fields=['is_verified'])
        return Response({'message': 'Expense verified successfully'})

    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        """Bulk delete expenses."""
        ids = request.data.get('ids', [])
        if not ids:
            return Response(
                {'error': 'No expense IDs provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        deleted_count = Expense.objects.filter(
            id__in=ids,
            user=request.user
        ).delete()[0]

        return Response({
            'message': f'{deleted_count} expenses deleted successfully',
            'count': deleted_count
        })


class RecurringExpenseViewSet(viewsets.ModelViewSet):
    """
    API endpoint for recurring expenses.
    """
    serializer_class = RecurringExpenseSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        """Filter recurring expenses by authenticated user."""
        return RecurringExpense.objects.filter(user=self.request.user).select_related(
            'category', 'currency'
        )

    @action(detail=True, methods=['post'])
    def generate(self, request, pk=None):
        """Manually generate next expense instance."""
        recurring = self.get_object()
        expense = recurring.generate_next_expense()

        if expense:
            return Response({
                'message': 'Expense generated successfully',
                'expense': ExpenseSerializer(expense, context={'request': request}).data
            })

        return Response(
            {'error': 'Cannot generate expense (inactive or past end date)'},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle active status of recurring expense."""
        recurring = self.get_object()
        recurring.is_active = not recurring.is_active
        recurring.save(update_fields=['is_active'])

        return Response({
            'message': f'Recurring expense {"activated" if recurring.is_active else "deactivated"}',
            'is_active': recurring.is_active
        })
