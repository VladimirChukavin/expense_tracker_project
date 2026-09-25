from rest_framework import views, permissions
from rest_framework.response import Response
from django.utils.dateparse import parse_date
from .services import AnalyticsService


def _parse_limit(value, default=10, max_value=100):
    if value is None:
        return default
    try:
        limit = int(value)
    except (TypeError, ValueError):
        return None
    if limit <= 0:
        return None
    return min(limit, max_value)


def _parse_date_param(value):
    if value is None:
        return None
    parsed = parse_date(value)
    return parsed if parsed else None


class AnalyticsSummaryView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        start_date = _parse_date_param(request.query_params.get('start_date'))
        end_date = _parse_date_param(request.query_params.get('end_date'))

        if start_date is None and request.query_params.get('start_date'):
            return Response(
                {'start_date': 'Invalid date format. Use YYYY-MM-DD.'}, status=400
            )
        if end_date is None and request.query_params.get('end_date'):
            return Response(
                {'end_date': 'Invalid date format. Use YYYY-MM-DD.'}, status=400
            )

        summary = AnalyticsService.get_summary(
            request.user,
            start_date,
            end_date,
            request.query_params.get('currency')
        )

        return Response(summary)


class AnalyticsByCategoryView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        start_date = _parse_date_param(request.query_params.get('start_date'))
        end_date = _parse_date_param(request.query_params.get('end_date'))
        limit = _parse_limit(request.query_params.get('limit'))

        if limit is None:
            return Response({'limit': 'Must be a positive integer.'}, status=400)

        data = AnalyticsService.get_by_category(
            request.user,
            start_date,
            end_date,
            request.query_params.get('currency'),
            limit
        )

        return Response(data)


class AnalyticsByPeriodView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        period = request.query_params.get('period', 'day')
        start_date = _parse_date_param(request.query_params.get('start_date'))
        end_date = _parse_date_param(request.query_params.get('end_date'))

        if period not in ('day', 'week', 'month', 'year'):
            return Response(
                {'period': 'Must be one of: day, week, month, year.'}, status=400
            )

        data = AnalyticsService.get_by_period(
            request.user,
            period,
            start_date,
            end_date,
            request.query_params.get('currency')
        )

        return Response(data)


class AnalyticsTrendsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        days = _parse_limit(request.query_params.get('days'), default=30, max_value=366)

        if days is None:
            return Response({'days': 'Must be a positive integer.'}, status=400)

        data = AnalyticsService.get_trends(
            request.user, days, request.query_params.get('currency')
        )

        return Response(data)


class AnalyticsTopExpensesView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        start_date = _parse_date_param(request.query_params.get('start_date'))
        end_date = _parse_date_param(request.query_params.get('end_date'))
        limit = _parse_limit(request.query_params.get('limit'))

        if limit is None:
            return Response({'limit': 'Must be a positive integer.'}, status=400)

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
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        params = request.query_params
        current_start = _parse_date_param(params.get('current_start'))
        current_end = _parse_date_param(params.get('current_end'))
        previous_start = _parse_date_param(params.get('previous_start'))
        previous_end = _parse_date_param(params.get('previous_end'))

        if not all([current_start, current_end, previous_start, previous_end]):
            return Response(
                {'error': 'All date parameters are required (YYYY-MM-DD)'},
                status=400
            )

        data = AnalyticsService.compare_periods(
            request.user,
            current_start,
            current_end,
            previous_start,
            previous_end,
            params.get('currency')
        )

        return Response(data)
