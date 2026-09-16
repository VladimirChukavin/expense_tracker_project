"""
Expense serializers.
"""
from rest_framework import serializers
from .models import Expense, RecurringExpense
from apps.categories.serializers import CategoryListSerializer
from apps.tags.serializers import TagSerializer


class ExpenseSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for expense model.
    """
    category_detail = CategoryListSerializer(source='category', read_only=True)
    tags_detail = TagSerializer(source='tags', many=True, read_only=True)
    currency_code = serializers.CharField(source='currency.code', read_only=True)

    class Meta:
        model = Expense
        fields = (
            'id', 'amount', 'currency', 'currency_code', 'category',
            'category_detail', 'date', 'description', 'notes',
            'payment_method', 'location', 'receipt', 'tags', 'tags_detail',
            'recurring_expense', 'is_verified', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_category(self, value):
        """Validate that category belongs to the user."""
        user = self.context['request'].user
        if value.user != user:
            raise serializers.ValidationError("Cannot use category from another user.")
        return value

    def validate_tags(self, value):
        """Validate that all tags belong to the user."""
        user = self.context['request'].user
        for tag in value:
            if tag.user != user:
                raise serializers.ValidationError("Cannot use tags from another user.")
        return value

    def create(self, validated_data):
        """Create expense with user from request."""
        tags = validated_data.pop('tags', [])
        validated_data['user'] = self.context['request'].user
        expense = Expense.objects.create(**validated_data)
        if tags:
            expense.tags.set(tags)
        return expense


class ExpenseListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for expense lists.
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_icon = serializers.CharField(source='category.icon', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    currency_code = serializers.CharField(source='currency.code', read_only=True)

    class Meta:
        model = Expense
        fields = (
            'id', 'amount', 'currency_code', 'category_name',
            'category_icon', 'category_color', 'date', 'description',
            'payment_method', 'is_verified'
        )


class RecurringExpenseSerializer(serializers.ModelSerializer):
    """
    Serializer for recurring expense model.
    """
    category_detail = CategoryListSerializer(source='category', read_only=True)
    currency_code = serializers.CharField(source='currency.code', read_only=True)
    instances_count = serializers.SerializerMethodField()

    class Meta:
        model = RecurringExpense
        fields = (
            'id', 'amount', 'currency', 'currency_code', 'category',
            'category_detail', 'description', 'notes', 'frequency',
            'start_date', 'end_date', 'next_date', 'payment_method',
            'is_active', 'auto_generate', 'instances_count',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'next_date', 'created_at', 'updated_at')

    def get_instances_count(self, obj):
        """Get count of generated expense instances."""
        return obj.instances.count()

    def validate_category(self, value):
        """Validate that category belongs to the user."""
        user = self.context['request'].user
        if value.user != user:
            raise serializers.ValidationError("Cannot use category from another user.")
        return value

    def validate(self, attrs):
        """Validate date range."""
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')

        if end_date and start_date and end_date < start_date:
            raise serializers.ValidationError("End date must be after start date.")

        return attrs

    def create(self, validated_data):
        """Create recurring expense with user and next_date."""
        validated_data['user'] = self.context['request'].user
        validated_data['next_date'] = validated_data['start_date']
        return super().create(validated_data)
