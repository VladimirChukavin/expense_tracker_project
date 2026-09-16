"""
Analytics views.
"""
from rest_framework import views, permissions
from rest_framework.response import Response
from django.utils.dateparse import parse_date
from .services import AnalyticsService


class AnalyticsSummaryView(views.APIView):
    """
    Get summary statistics for expenses.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        currency = request.query_params.get('currency')

        if start_date:
            start_date = parse_date(start_date)
        if end_date:
            end_date = parse_date(end_date)

        summary = AnalyticsService.get_summary(
            request.user,
            start_date,
            end_date,
            currency
        )

        return Response(summary)


class AnalyticsByCategoryView(views.APIView):
    """
    Get expenses grouped by category.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        currency = request.query_params.get('currency')
        limit = int(request.query_params.get('limit', 10))

        if start_date:
            start_date = parse_date(start_date)
        if end_date:
            end_date = parse_date(end_date)

        data = AnalyticsService.get_by_category(
            request.user,
            start_date,
            end_date,
            currency,
            limit
        )

        return Response(data)


class AnalyticsByPeriodView(views.APIView):
    """
    Get expenses grouped by time period.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        period = request.query_params.get('period', 'day')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        currency = request.query_params.get('currency')

        if start_date:
            start_date = parse_date(start_date)
        if end_date:
            end_date = parse_date(end_date)

        data = AnalyticsService.get_by_period(
            request.user,
            period,
            start_date,
            end_date,
            currency
        )

        return Response(data)


class AnalyticsTrendsView(views.APIView):
    """
    Get expense trends over time.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        currency = request.query_params.get('currency')

        data = AnalyticsService.get_trends(request.user, days, currency)

        return Response(data)


class AnalyticsTopExpensesView(views.APIView):
    """
    Get top expenses by amount.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        limit = int(request.query_params.get('limit', 10))

        if start_date:
            start_date = parse_date(start_date)
        if end_date:
            end_date = parse_date(end_date)

        expenses = AnalyticsService.get_top_expenses(
            request.user,
            start_date,
            end_date,
            limit
        )

        from apps.expenses.serializers import ExpenseListSerializer
        serializer = ExpenseListSerializer(expenses, many=True, context={'request': request})

        return Response(serializer.data)


class AnalyticsCompareView(views.APIView):
    """
    Compare expenses between two periods.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        current_start = parse_date(request.query_params.get('current_start'))
        current_end = parse_date(request.query_params.get('current_end'))
        previous_start = parse_date(request.query_params.get('previous_start'))
        previous_end = parse_date(request.query_params.get('previous_end'))
        currency = request.query_params.get('currency')

        if not all([current_start, current_end, previous_start, previous_end]):
            return Response(
                {'error': 'All date parameters are required'},
                status=400
            )

        data = AnalyticsService.compare_periods(
            request.user,
            current_start,
            current_end,
            previous_start,
            previous_end,
            currency
        )

        return Response(data)
