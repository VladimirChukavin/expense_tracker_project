"""
Expense model for tracking expenses.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator
from decimal import Decimal
from core.models import TimeStampedModel, UserOwnedModel


class Expense(TimeStampedModel, UserOwnedModel):
    """
    Main expense model.
    """
    PAYMENT_METHODS = [
        ('cash', _('Cash')),
        ('card', _('Card')),
        ('bank_transfer', _('Bank Transfer')),
        ('mobile_payment', _('Mobile Payment')),
        ('crypto', _('Cryptocurrency')),
        ('other', _('Other')),
    ]

    amount = models.DecimalField(
        _('amount'),
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    currency = models.ForeignKey(
        'currencies.Currency',
        on_delete=models.PROTECT,
        related_name='expenses'
    )
    category = models.ForeignKey(
        'categories.Category',
        on_delete=models.PROTECT,
        related_name='expenses'
    )
    date = models.DateField(_('date'))
    description = models.TextField(_('description'), blank=True)
    notes = models.TextField(_('notes'), blank=True)

    # Payment details
    payment_method = models.CharField(
        _('payment method'),
        max_length=20,
        choices=PAYMENT_METHODS,
        default='cash'
    )

    # Location and receipt
    location = models.CharField(_('location'), max_length=255, blank=True)
    receipt = models.ImageField(_('receipt'), upload_to='receipts/%Y/%m/', blank=True, null=True)

    # Tags and organization
    tags = models.ManyToManyField('tags.Tag', blank=True, related_name='expenses')

    # Recurring expense reference
    recurring_expense = models.ForeignKey(
        'RecurringExpense',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='instances'
    )

    # Metadata
    is_verified = models.BooleanField(_('is verified'), default=False)

    class Meta:
        db_table = 'expenses'
        verbose_name = _('Expense')
        verbose_name_plural = _('Expenses')
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['user', 'date']),
            models.Index(fields=['user', 'category']),
            models.Index(fields=['date']),
        ]

    def __str__(self):
        return f"{self.amount} {self.currency.code} - {self.category.name} ({self.date})"

    def get_converted_amount(self, target_currency):
        """Convert expense amount to target currency."""
        if self.currency == target_currency:
            return self.amount

        # Here should be currency conversion logic
        # For now, return original amount
        return self.amount


class RecurringExpense(TimeStampedModel, UserOwnedModel):
    """
    Model for recurring expenses.
    """
    FREQUENCY_CHOICES = [
        ('daily', _('Daily')),
        ('weekly', _('Weekly')),
        ('monthly', _('Monthly')),
        ('yearly', _('Yearly')),
    ]

    amount = models.DecimalField(
        _('amount'),
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    currency = models.ForeignKey(
        'currencies.Currency',
        on_delete=models.PROTECT,
        related_name='recurring_expenses'
    )
    category = models.ForeignKey(
        'categories.Category',
        on_delete=models.PROTECT,
        related_name='recurring_expenses'
    )
    description = models.TextField(_('description'))
    notes = models.TextField(_('notes'), blank=True)

    frequency = models.CharField(_('frequency'), max_length=20, choices=FREQUENCY_CHOICES)
    start_date = models.DateField(_('start date'))
    end_date = models.DateField(_('end date'), null=True, blank=True)
    next_date = models.DateField(_('next date'))

    payment_method = models.CharField(
        _('payment method'),
        max_length=20,
        choices=Expense.PAYMENT_METHODS,
        default='cash'
    )

    is_active = models.BooleanField(_('is active'), default=True)
    auto_generate = models.BooleanField(_('auto generate'), default=True)

    class Meta:
        db_table = 'recurring_expenses'
        verbose_name = _('Recurring Expense')
        verbose_name_plural = _('Recurring Expenses')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'next_date', 'is_active']),
        ]

    def __str__(self):
        return f"{self.description} - {self.amount} {self.currency.code} ({self.get_frequency_display()})"

    def generate_next_expense(self):
        """Generate the next expense instance."""
        from datetime import timedelta

        if not self.is_active:
            return None

        if self.end_date and self.next_date > self.end_date:
            self.is_active = False
            self.save()
            return None

        expense = Expense.objects.create(
            user=self.user,
            amount=self.amount,
            currency=self.currency,
            category=self.category,
            date=self.next_date,
            description=self.description,
            notes=self.notes,
            payment_method=self.payment_method,
            recurring_expense=self
        )

        # Update next_date
        if self.frequency == 'daily':
            self.next_date += timedelta(days=1)
        elif self.frequency == 'weekly':
            self.next_date += timedelta(weeks=1)
        elif self.frequency == 'monthly':
            # Add one month (approximate)
            self.next_date = self.next_date.replace(month=self.next_date.month % 12 + 1)
        elif self.frequency == 'yearly':
            self.next_date = self.next_date.replace(year=self.next_date.year + 1)

        self.save()
        return expense
