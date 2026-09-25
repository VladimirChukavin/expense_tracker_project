from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Currency, ExchangeRate
from .serializers import CurrencySerializer, ExchangeRateSerializer


class CurrencyViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CurrencySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Currency.objects.filter(is_active=True)
        return queryset

    @action(detail=False, methods=['get'])
    def all(self, request):
        currencies = Currency.objects.all()
        serializer = self.get_serializer(currencies, many=True)
        return Response(serializer.data)


class ExchangeRateViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ExchangeRateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = ExchangeRate.objects.select_related('from_currency', 'to_currency')

        from_currency = self.request.query_params.get('from_currency')
        to_currency = self.request.query_params.get('to_currency')

        if from_currency:
            queryset = queryset.filter(from_currency__code=from_currency)
        if to_currency:
            queryset = queryset.filter(to_currency__code=to_currency)

        return queryset

    @action(detail=False, methods=['get'])
    def convert(self, request):
        from_code = request.query_params.get('from')
        to_code = request.query_params.get('to')
        amount = request.query_params.get('amount')

        if not all([from_code, to_code, amount]):
            return Response(
                {'error': 'from, to, and amount parameters are required'},
                status=400
            )

        try:
            amount = float(amount)
        except ValueError:
            return Response({'error': 'Invalid amount'}, status=400)

        rate = ExchangeRate.objects.filter(
            from_currency__code=from_code,
            to_currency__code=to_code
        ).order_by('-date').first()

        if not rate:
            return Response({'error': 'Exchange rate not found'}, status=404)

        converted = amount * float(rate.rate)

        return Response({
            'from_currency': from_code,
            'to_currency': to_code,
            'amount': amount,
            'converted': round(converted, 2),
            'rate': float(rate.rate),
            'rate_date': rate.date
        })
