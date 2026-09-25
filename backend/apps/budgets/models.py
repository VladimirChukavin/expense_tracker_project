from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator
from decimal import Decimal
from core.models import TimeStampedModel, UserOwnedModel


class BudgetQuerySet(models.QuerySet):

    def with_spent_amount(self):
        from django.db.models import Subquery, Sum, OuterRef, F
        from django.db.models.functions import Coalesce
        from apps.expenses.models import Expense

        spent_subquery = Expense.objects.filter(
            user=OuterRef('user_id'),
            date__gte=OuterRef('start_date'),
            date__lte=Coalesce(OuterRef('end_date'), F('date')),
            currency=OuterRef('currency_id'),
            category_id=Coalesce(OuterRef('category_id'), F('category_id')),
        ).order_by().values('user').annotate(
            total=Sum('amount')
        ).values('total')[:1]

        return self.annotate(spent_amount_annotation=Subquery(spent_subquery))


class Budget(TimeStampedModel, UserOwnedModel):
    objects = BudgetQuerySet.as_manager()
    PERIOD_CHOICES = [
        ('daily', _('Daily')),
        ('weekly', _('Weekly')),
        ('monthly', _('Monthly')),
        ('yearly', _('Yearly')),
        ('custom', _('Custom')),
    ]

    name = models.CharField(_('name'), max_length=100)
    amount = models.DecimalField(
        _('amount'),
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    currency = models.ForeignKey(
        'currencies.Currency',
        on_delete=models.PROTECT,
        related_name='budgets'
    )

    period = models.CharField(_('period'), max_length=20, choices=PERIOD_CHOICES)
    start_date = models.DateField(_('start date'))
    end_date = models.DateField(_('end date'), null=True, blank=True)

    category = models.ForeignKey(
        'categories.Category',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='budgets',
        help_text=_('Leave empty for total budget')
    )

    alert_threshold = models.IntegerField(
        _('alert threshold'),
        default=80,
        validators=[MinValueValidator(0)],
        help_text=_('Alert when spending reaches this percentage')
    )
    alert_enabled = models.BooleanField(_('alert enabled'), default=True)

    is_active = models.BooleanField(_('is active'), default=True)

    class Meta:
        db_table = 'budgets'
        verbose_name = _('Budget')
        verbose_name_plural = _('Budgets')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['start_date', 'end_date']),
        ]

    def __str__(self):
        return f"{self.name} - {self.amount} {self.currency.code}"

    def get_spent_amount(self):
        annotated = getattr(self, 'spent_amount_annotation', None)
        if annotated is not None:
            return annotated

        from apps.expenses.models import Expense

        expenses = Expense.objects.filter(
            user=self.user,
            date__gte=self.start_date,
            currency=self.currency
        )

        if self.end_date:
            expenses = expenses.filter(date__lte=self.end_date)

        if self.category:
            expenses = expenses.filter(category=self.category)

        return expenses.aggregate(total=models.Sum('amount'))['total'] or Decimal('0')

    def get_remaining_amount(self):
        return self.amount - self.get_spent_amount()

    def get_spent_percentage(self):
        spent = self.get_spent_amount()
        if self.amount > 0:
            return float((spent / self.amount) * 100)
        return 0

    def is_exceeded(self):
        return self.get_spent_amount() > self.amount

    def should_alert(self):
        return self.alert_enabled and self.get_spent_percentage() >= self.alert_threshold
