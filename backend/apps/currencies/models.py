from django.db import models
from django.utils.translation import gettext_lazy as _
from core.models import TimeStampedModel


class Currency(TimeStampedModel):
    code = models.CharField(_('code'), max_length=3, unique=True)
    name = models.CharField(_('name'), max_length=50)
    symbol = models.CharField(_('symbol'), max_length=10)
    is_active = models.BooleanField(_('is active'), default=True)

    class Meta:
        db_table = 'currencies'
        verbose_name = _('Currency')
        verbose_name_plural = _('Currencies')
        ordering = ['code']

    def __str__(self):
        return f"{self.code} - {self.name}"


class ExchangeRate(TimeStampedModel):
    from_currency = models.ForeignKey(
        Currency,
        on_delete=models.CASCADE,
        related_name='rates_from'
    )
    to_currency = models.ForeignKey(
        Currency,
        on_delete=models.CASCADE,
        related_name='rates_to'
    )
    rate = models.DecimalField(_('rate'), max_digits=12, decimal_places=6)
    date = models.DateField(_('date'))

    class Meta:
        db_table = 'exchange_rates'
        verbose_name = _('Exchange Rate')
        verbose_name_plural = _('Exchange Rates')
        unique_together = [['from_currency', 'to_currency', 'date']]
        ordering = ['-date']
        indexes = [
            models.Index(fields=['from_currency', 'to_currency', 'date']),
        ]

    def __str__(self):
        return f"{self.from_currency.code} -> {self.to_currency.code}: {self.rate} ({self.date})"
