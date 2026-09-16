"""
Tag serializers.
"""
from rest_framework import serializers
from .models import Tag


class TagSerializer(serializers.ModelSerializer):
    """
    Serializer for tag model.
    """
    expense_count = serializers.SerializerMethodField()

    class Meta:
        model = Tag
        fields = ('id', 'name', 'color', 'description', 'expense_count', 'created_at')
        read_only_fields = ('id', 'created_at')

    def get_expense_count(self, obj):
        """Get count of expenses with this tag."""
        return obj.expenses.count()

    def validate_name(self, value):
        """Validate uniqueness for user."""
        user = self.context['request'].user
        if Tag.objects.filter(user=user, name=value).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError("Tag with this name already exists.")
        return value

    def create(self, validated_data):
        """Create tag with user from request."""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
