from rest_framework import serializers
from .models import Currency, ExchangeRate


class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = ('id', 'code', 'name', 'symbol', 'is_active', 'created_at')
        read_only_fields = ('id', 'created_at')


class ExchangeRateSerializer(serializers.ModelSerializer):
    from_currency_code = serializers.CharField(source='from_currency.code', read_only=True)
    to_currency_code = serializers.CharField(source='to_currency.code', read_only=True)

    class Meta:
        model = ExchangeRate
        fields = (
            'id', 'from_currency', 'from_currency_code',
            'to_currency', 'to_currency_code', 'rate', 'date', 'created_at'
        )
        read_only_fields = ('id', 'created_at')

    def validate(self, attrs):
        if attrs.get('from_currency') == attrs.get('to_currency'):
            raise serializers.ValidationError("From and to currencies must be different.")
        return attrs
