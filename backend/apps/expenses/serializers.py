from rest_framework import serializers
from django.conf import settings
from .models import Expense, RecurringExpense
from apps.categories.serializers import CategoryListSerializer
from apps.tags.serializers import TagSerializer


class ExpenseSerializer(serializers.ModelSerializer):
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
        user = self.context['request'].user
        if value.user != user:
            raise serializers.ValidationError("Cannot use category from another user.")
        return value

    def validate_tags(self, value):
        user = self.context['request'].user
        for tag in value:
            if tag.user != user:
                raise serializers.ValidationError("Cannot use tags from another user.")
        return value

    def validate_receipt(self, value):
        if value and hasattr(value, 'size') and value.size > settings.MAX_UPLOAD_SIZE:
            raise serializers.ValidationError(
                f"Receipt file is too large. Maximum size is "
                f"{settings.MAX_UPLOAD_SIZE // (1024 * 1024)}MB."
            )
        return value

    def create(self, validated_data):
        tags = validated_data.pop('tags', [])
        validated_data['user'] = self.context['request'].user
        expense = Expense.objects.create(**validated_data)
        if tags:
            expense.tags.set(tags)
        return expense

    def update(self, instance, validated_data):
        if self.context['request'].data.get('receipt_clear') in ('true', 'True', '1'):
            validated_data['receipt'] = None
        return super().update(instance, validated_data)


class ExpenseListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_icon = serializers.CharField(source='category.icon', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    currency_code = serializers.CharField(source='currency.code', read_only=True)
    tag_names = serializers.SerializerMethodField()

    class Meta:
        model = Expense
        fields = (
            'id', 'amount', 'currency_code', 'category_name',
            'category_icon', 'category_color', 'date', 'description',
            'payment_method', 'is_verified', 'receipt', 'tags', 'tag_names'
        )

    def get_tag_names(self, obj):
        return [tag.name for tag in obj.tags.all()]


class RecurringExpenseSerializer(serializers.ModelSerializer):
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
        return obj.instances.count()

    def validate_category(self, value):
        user = self.context['request'].user
        if value.user != user:
            raise serializers.ValidationError("Cannot use category from another user.")
        return value

    def validate(self, attrs):
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')

        if end_date and start_date and end_date < start_date:
            raise serializers.ValidationError("End date must be after start date.")

        return attrs

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        validated_data['next_date'] = validated_data['start_date']
        return super().create(validated_data)
