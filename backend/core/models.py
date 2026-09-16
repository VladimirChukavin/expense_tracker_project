"""
Core models for reusable functionality.
"""
from django.db import models
from django.conf import settings


class TimeStampedModel(models.Model):
    """
    Abstract model with created_at and updated_at fields.
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class UserOwnedModel(models.Model):
    """
    Abstract model with user foreign key.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    class Meta:
        abstract = True
