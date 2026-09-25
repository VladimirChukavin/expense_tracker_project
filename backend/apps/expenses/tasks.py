from celery import shared_task
from django.db import transaction
from django.utils import timezone
from apps.expenses.models import RecurringExpense


@shared_task
def generate_recurring_expenses():
    today = timezone.now().date()
    recurring_expenses = RecurringExpense.objects.filter(
        is_active=True,
        auto_generate=True,
        next_date__lte=today
    ).select_related('currency', 'category')

    generated_count = 0
    for recurring in recurring_expenses:
        try:
            with transaction.atomic():
                expense = recurring.generate_next_expense()
        except Exception:
            continue
        if expense:
            generated_count += 1

    return f'Generated {generated_count} expenses from recurring expenses'


@shared_task
def check_budget_alerts():
    from apps.budgets.models import Budget

    budgets = Budget.objects.filter(
        is_active=True, alert_enabled=True
    ).with_spent_amount()

    alerts = []
    for budget in budgets:
        if budget.should_alert():
            alerts.append({
                'budget_id': budget.id,
                'budget_name': budget.name,
                'spent_percentage': budget.get_spent_percentage()
            })

    return f'Found {len(alerts)} budget alerts'


@shared_task
def cleanup_old_data():
    # Example: delete old logs, temporary files, etc.
    # This is a placeholder for future cleanup tasks
    return 'Cleanup completed'
