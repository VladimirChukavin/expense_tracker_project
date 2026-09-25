from django.db import models
from django.utils.translation import gettext_lazy as _
from core.models import TimeStampedModel, UserOwnedModel


class Tag(TimeStampedModel, UserOwnedModel):
    name = models.CharField(_('name'), max_length=50)
    color = models.CharField(_('color'), max_length=7, default='#6B7280')
    description = models.TextField(_('description'), blank=True)

    class Meta:
        db_table = 'tags'
        verbose_name = _('Tag')
        verbose_name_plural = _('Tags')
        unique_together = [['user', 'name']]
        ordering = ['name']

    def __str__(self):
        return self.name
