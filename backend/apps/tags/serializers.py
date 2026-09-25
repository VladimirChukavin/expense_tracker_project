from rest_framework import serializers
from .models import Tag


class TagSerializer(serializers.ModelSerializer):
    expense_count = serializers.SerializerMethodField()

    class Meta:
        model = Tag
        fields = ('id', 'name', 'color', 'description', 'expense_count', 'created_at')
        read_only_fields = ('id', 'created_at')

    def get_expense_count(self, obj):
        return obj.expenses.count()

    def validate_name(self, value):
        user = self.context['request'].user
        if Tag.objects.filter(user=user, name=value).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError("Tag with this name already exists.")
        return value

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
