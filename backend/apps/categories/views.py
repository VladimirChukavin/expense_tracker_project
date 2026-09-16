"""
Category views.
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from core.permissions import IsOwner
from .models import Category
from .serializers import CategorySerializer, CategoryListSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint for categories.
    """
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        """Filter categories by authenticated user."""
        queryset = Category.objects.filter(user=self.request.user)

        # Filter by parent
        parent_id = self.request.query_params.get('parent')
        if parent_id == 'null':
            queryset = queryset.filter(parent__isnull=True)
        elif parent_id:
            queryset = queryset.filter(parent_id=parent_id)

        return queryset

    def get_serializer_class(self):
        """Use simplified serializer for list action."""
        if self.action == 'list':
            return CategoryListSerializer
        return CategorySerializer

    @action(detail=False, methods=['get'])
    def tree(self, request):
        """Get categories as hierarchical tree."""
        root_categories = Category.objects.filter(user=request.user, parent__isnull=True)
        serializer = CategorySerializer(root_categories, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def expenses(self, request, pk=None):
        """Get expenses for specific category."""
        category = self.get_object()
        from apps.expenses.models import Expense
        from apps.expenses.serializers import ExpenseListSerializer

        expenses = Expense.objects.filter(category=category, user=request.user)

        # Apply date filters
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        if start_date:
            expenses = expenses.filter(date__gte=start_date)
        if end_date:
            expenses = expenses.filter(date__lte=end_date)

        serializer = ExpenseListSerializer(expenses, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def reorder(self, request, pk=None):
        """Reorder categories."""
        category = self.get_object()
        new_order = request.data.get('order')

        if new_order is not None:
            category.order = new_order
            category.save(update_fields=['order'])
            return Response({'message': 'Category reordered successfully'})

        return Response({'error': 'Order value is required'}, status=status.HTTP_400_BAD_REQUEST)
