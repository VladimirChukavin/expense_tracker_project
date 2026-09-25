from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
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
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ExpenseFilter
    search_fields = ['description', 'notes', 'location']
    ordering_fields = ['date', 'amount', 'created_at']
    ordering = ['-date', '-created_at']

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user).select_related(
            'category', 'currency', 'recurring_expense'
        ).prefetch_related('tags')

    def get_serializer_class(self):
        if self.action == 'list':
            return ExpenseListSerializer
        return ExpenseSerializer

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        expense = self.get_object()
        expense.is_verified = True
        expense.save(update_fields=['is_verified'])
        return Response({'message': 'Expense verified successfully'})

    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        ids = request.data.get('ids', [])
        if not isinstance(ids, list) or not ids:
            return Response(
                {'ids': 'Provide a non-empty list of expense IDs.'},
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
    serializer_class = RecurringExpenseSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return RecurringExpense.objects.filter(user=self.request.user).select_related(
            'category', 'currency'
        )

    @action(detail=True, methods=['post'])
    def generate(self, request, pk=None):
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
        recurring = self.get_object()
        recurring.is_active = not recurring.is_active
        recurring.save(update_fields=['is_active'])

        return Response({
            'message': f'Recurring expense {"activated" if recurring.is_active else "deactivated"}',
            'is_active': recurring.is_active
        })
