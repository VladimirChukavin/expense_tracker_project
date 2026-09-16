"""
Analytics service for expense insights.
"""
from django.db.models import Sum, Count, Avg, Q
from django.db.models.functions import TruncDate, TruncWeek, TruncMonth, TruncYear
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from apps.expenses.models import Expense


class AnalyticsService:
    """
    Service for generating analytics and insights.
    """

    @staticmethod
    def get_summary(user, start_date=None, end_date=None, currency=None):
        """
        Get summary statistics for expenses.
        """
        expenses = Expense.objects.filter(user=user)

        if start_date:
            expenses = expenses.filter(date__gte=start_date)
        if end_date:
            expenses = expenses.filter(date__lte=end_date)
        if currency:
            expenses = expenses.filter(currency=currency)

        total = expenses.aggregate(total=Sum('amount'))['total'] or Decimal('0')
        count = expenses.count()
        avg = expenses.aggregate(avg=Avg('amount'))['avg'] or Decimal('0')

        return {
            'total': float(total),
            'count': count,
            'average': float(avg)
        }

    @staticmethod
    def get_by_category(user, start_date=None, end_date=None, currency=None, limit=10):
        """
        Get expenses grouped by category.
        """
        expenses = Expense.objects.filter(user=user)

        if start_date:
            expenses = expenses.filter(date__gte=start_date)
        if end_date:
            expenses = expenses.filter(date__lte=end_date)
        if currency:
            expenses = expenses.filter(currency=currency)

        by_category = expenses.values(
            'category__id',
            'category__name',
            'category__icon',
            'category__color'
        ).annotate(
            total=Sum('amount'),
            count=Count('id'),
            avg=Avg('amount')
        ).order_by('-total')[:limit]

        return list(by_category)

    @staticmethod
    def get_by_period(user, period='day', start_date=None, end_date=None, currency=None):
        """
        Get expenses grouped by time period.
        """
        expenses = Expense.objects.filter(user=user)

        if start_date:
            expenses = expenses.filter(date__gte=start_date)
        if end_date:
            expenses = expenses.filter(date__lte=end_date)
        if currency:
            expenses = expenses.filter(currency=currency)

        trunc_func = {
            'day': TruncDate,
            'week': TruncWeek,
            'month': TruncMonth,
            'year': TruncYear
        }.get(period, TruncDate)

        by_period = expenses.annotate(
            period=trunc_func('date')
        ).values('period').annotate(
            total=Sum('amount'),
            count=Count('id'),
            avg=Avg('amount')
        ).order_by('period')

        return list(by_period)

    @staticmethod
    def get_trends(user, days=30, currency=None):
        """
        Get expense trends for the last N days.
        """
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)

        expenses = Expense.objects.filter(
            user=user,
            date__gte=start_date,
            date__lte=end_date
        )

        if currency:
            expenses = expenses.filter(currency=currency)

        by_date = expenses.values('date').annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('date')

        # Fill missing dates with zeros
        date_dict = {item['date']: item for item in by_date}

        result = []
        current_date = start_date
        while current_date <= end_date:
            if current_date in date_dict:
                result.append(date_dict[current_date])
            else:
                result.append({
                    'date': current_date,
                    'total': 0,
                    'count': 0
                })
            current_date += timedelta(days=1)

        return result

    @staticmethod
    def get_top_expenses(user, start_date=None, end_date=None, limit=10):
        """
        Get top expenses by amount.
        """
        expenses = Expense.objects.filter(user=user)

        if start_date:
            expenses = expenses.filter(date__gte=start_date)
        if end_date:
            expenses = expenses.filter(date__lte=end_date)

        return expenses.select_related('category', 'currency').order_by('-amount')[:limit]

    @staticmethod
    def compare_periods(user, current_start, current_end, previous_start, previous_end, currency=None):
        """
        Compare expenses between two periods.
        """
        current = AnalyticsService.get_summary(user, current_start, current_end, currency)
        previous = AnalyticsService.get_summary(user, previous_start, previous_end, currency)

        diff = current['total'] - previous['total']
        percent_change = 0
        if previous['total'] > 0:
            percent_change = (diff / previous['total']) * 100

        return {
            'current': current,
            'previous': previous,
            'difference': float(diff),
            'percent_change': round(percent_change, 2)
        }
