"""
Category serializers.
"""
from rest_framework import serializers
from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer for category model.
    """
    full_path = serializers.CharField(read_only=True)
    subcategories = serializers.SerializerMethodField()
    total_expenses = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = (
            'id', 'name', 'icon', 'color', 'description', 'parent',
            'is_default', 'order', 'full_path', 'subcategories',
            'total_expenses', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'is_default')

    def get_subcategories(self, obj):
        """Get subcategories recursively."""
        if obj.subcategories.exists():
            return CategorySerializer(obj.subcategories.all(), many=True, context=self.context).data
        return []

    def get_total_expenses(self, obj):
        """Get total expenses for category."""
        request = self.context.get('request')
        if request and hasattr(request, 'query_params'):
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            return float(obj.get_total_expenses(start_date, end_date))
        return 0

    def validate_parent(self, value):
        """Validate parent category."""
        if value:
            # Check if parent belongs to the same user
            user = self.context['request'].user
            if value.user != user:
                raise serializers.ValidationError("Cannot use category from another user.")

            # Check for circular reference
            if self.instance and value.id == self.instance.id:
                raise serializers.ValidationError("Category cannot be its own parent.")

            # Check depth (max 2 levels)
            if value.parent is not None:
                raise serializers.ValidationError("Maximum nesting depth is 2 levels.")

        return value

    def create(self, validated_data):
        """Create category with user from request."""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class CategoryListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for category lists.
    """
    full_path = serializers.CharField(read_only=True)

    class Meta:
        model = Category
        fields = ('id', 'name', 'icon', 'color', 'parent', 'full_path', 'order')
