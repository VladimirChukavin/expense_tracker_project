"""
Celery configuration for expense tracker project.
"""
import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

app = Celery('expense_tracker')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Celery Beat schedule
app.conf.beat_schedule = {
    'create-recurring-expenses': {
        'task': 'apps.recurring.tasks.create_recurring_expenses',
        'schedule': crontab(hour=0, minute=0),  # Ежедневно в полночь
    },
    'check-budget-alerts': {
        'task': 'apps.budgets.tasks.check_budget_alerts',
        'schedule': crontab(hour=8, minute=0),  # Ежедневно в 8 утра
    },
    'update-exchange-rates': {
        'task': 'apps.currencies.tasks.update_exchange_rates',
        'schedule': crontab(hour=3, minute=0),  # Ежедневно в 3 ночи
    },
}

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
