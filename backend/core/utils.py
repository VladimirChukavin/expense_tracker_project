from decimal import Decimal
from datetime import date
from django.utils import timezone


def convert_currency(amount: Decimal, from_currency, to_currency, exchange_rate: Decimal = None) -> Decimal:
    if from_currency == to_currency:
        return amount

    if exchange_rate is None:
        from apps.currencies.models import ExchangeRate
        today = timezone.now().date()
        try:
            rate = ExchangeRate.objects.get(
                from_currency=from_currency,
                to_currency=to_currency,
                date=today
            )
            exchange_rate = rate.rate
        except ExchangeRate.DoesNotExist:
            raise ValueError(f"Exchange rate not found for {from_currency} to {to_currency}")

    return amount * exchange_rate


def get_date_range(period: str, start_date: date = None) -> tuple:
    from dateutil.relativedelta import relativedelta

    if start_date is None:
        start_date = timezone.now().date()

    if period == 'weekly':
        end_date = start_date + relativedelta(weeks=1)
    elif period == 'monthly':
        end_date = start_date + relativedelta(months=1)
    elif period == 'yearly':
        end_date = start_date + relativedelta(years=1)
    else:
        raise ValueError(f"Invalid period: {period}")

    return start_date, end_date


def calculate_next_occurrence(current_date: date, frequency: str, interval: int) -> date:
    from dateutil.relativedelta import relativedelta

    if frequency == 'daily':
        return current_date + relativedelta(days=interval)
    elif frequency == 'weekly':
        return current_date + relativedelta(weeks=interval)
    elif frequency == 'monthly':
        return current_date + relativedelta(months=interval)
    elif frequency == 'yearly':
        return current_date + relativedelta(years=interval)
    else:
        raise ValueError(f"Invalid frequency: {frequency}")


def format_currency(amount: Decimal, currency) -> str:
    return f"{currency.symbol}{amount:,.2f}"


def validate_file_size(file, max_size_mb: int = 5):
    max_size = max_size_mb * 1024 * 1024
    if file.size > max_size:
        raise ValueError(f"File size exceeds {max_size_mb}MB limit")


def validate_file_extension(file, allowed_extensions: list):
    import os
    ext = os.path.splitext(file.name)[1].lower().replace('.', '')
    if ext not in allowed_extensions:
        raise ValueError(f"File extension must be one of: {', '.join(allowed_extensions)}")
