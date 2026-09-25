from django.db import models
from django.utils.translation import gettext_lazy as _
from core.models import TimeStampedModel, UserOwnedModel


class Category(TimeStampedModel, UserOwnedModel):
    name = models.CharField(_('name'), max_length=100)
    icon = models.CharField(_('icon'), max_length=50, blank=True, help_text=_('Icon name or emoji'))
    color = models.CharField(_('color'), max_length=7, default='#6B7280', help_text=_('Hex color code'))
    description = models.TextField(_('description'), blank=True)
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='subcategories'
    )
    is_default = models.BooleanField(_('is default'), default=False)
    order = models.IntegerField(_('order'), default=0)

    class Meta:
        db_table = 'categories'
        verbose_name = _('Category')
        verbose_name_plural = _('Categories')
        ordering = ['order', 'name']
        unique_together = [['user', 'name', 'parent']]

    def __str__(self):
        if self.parent:
            return f"{self.parent.name} > {self.name}"
        return self.name

    @property
    def full_path(self):
        if self.parent:
            return f"{self.parent.full_path} > {self.name}"
        return self.name

    def get_total_expenses(self, start_date=None, end_date=None):
        from apps.expenses.models import Expense
        from django.db.models import Sum

        filters = {'category': self, 'user': self.user}
        if start_date:
            filters['date__gte'] = start_date
        if end_date:
            filters['date__lte'] = end_date

        result = Expense.objects.filter(**filters).aggregate(total=Sum('amount'))
        return result['total'] or 0
