"""
Celery tasks for expense tracking.
"""
from celery import shared_task
from django.utils import timezone
from apps.expenses.models import RecurringExpense


@shared_task
def generate_recurring_expenses():
    """
    Generate expenses from active recurring expenses.
    This task should be run daily.
    """
    today = timezone.now().date()
    recurring_expenses = RecurringExpense.objects.filter(
        is_active=True,
        auto_generate=True,
        next_date__lte=today
    )

    generated_count = 0
    for recurring in recurring_expenses:
        expense = recurring.generate_next_expense()
        if expense:
            generated_count += 1

    return f'Generated {generated_count} expenses from recurring expenses'


@shared_task
def check_budget_alerts():
    """
    Check budgets and send alerts when threshold is reached.
    This task should be run periodically.
    """
    from apps.budgets.models import Budget

    budgets = Budget.objects.filter(is_active=True, alert_enabled=True)
    alerts = []

    for budget in budgets:
        if budget.should_alert():
            alerts.append({
                'budget_id': budget.id,
                'budget_name': budget.name,
                'spent_percentage': budget.get_spent_percentage()
            })

    # Here you can send notifications (email, push, etc.)
    # For now, just return the alerts
    return f'Found {len(alerts)} budget alerts'


@shared_task
def cleanup_old_data():
    """
    Cleanup old data (optional maintenance task).
    """
    # Example: delete old logs, temporary files, etc.
    # This is a placeholder for future cleanup tasks
    return 'Cleanup completed'
