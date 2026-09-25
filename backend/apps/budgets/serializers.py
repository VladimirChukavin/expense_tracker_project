from rest_framework import serializers
from .models import Budget
from apps.categories.serializers import CategoryListSerializer


class BudgetSerializer(serializers.ModelSerializer):
    category_detail = CategoryListSerializer(source='category', read_only=True)
    currency_code = serializers.CharField(source='currency.code', read_only=True)
    spent_amount = serializers.SerializerMethodField()
    remaining_amount = serializers.SerializerMethodField()
    spent_percentage = serializers.SerializerMethodField()
    is_exceeded = serializers.SerializerMethodField()
    should_alert = serializers.SerializerMethodField()

    class Meta:
        model = Budget
        fields = (
            'id', 'name', 'amount', 'currency', 'currency_code',
            'period', 'start_date', 'end_date', 'category', 'category_detail',
            'alert_threshold', 'alert_enabled', 'is_active',
            'spent_amount', 'remaining_amount', 'spent_percentage',
            'is_exceeded', 'should_alert', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_spent_amount(self, obj):
        return float(obj.get_spent_amount())

    def get_remaining_amount(self, obj):
        return float(obj.amount - obj.get_spent_amount())

    def get_spent_percentage(self, obj):
        spent = obj.get_spent_amount()
        if obj.amount > 0:
            return round(float((spent / obj.amount) * 100), 2)
        return 0

    def get_is_exceeded(self, obj):
        return obj.get_spent_amount() > obj.amount

    def get_should_alert(self, obj):
        return obj.alert_enabled and self.get_spent_percentage(obj) >= obj.alert_threshold

    def validate_category(self, value):
        if value:
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
        return super().create(validated_data)


class BudgetListSerializer(serializers.ModelSerializer):
    currency_code = serializers.CharField(source='currency.code', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    spent_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Budget
        fields = (
            'id', 'name', 'amount', 'currency_code',
            'period', 'category_name', 'spent_percentage', 'is_active'
        )

    def get_spent_percentage(self, obj):
        spent = obj.get_spent_amount()
        if obj.amount > 0:
            return round(float((spent / obj.amount) * 100), 2)
        return 0
