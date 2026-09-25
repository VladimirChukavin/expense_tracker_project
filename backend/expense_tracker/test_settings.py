"""
Settings for tests and local development without Docker.

Наследует боевые настройки и подменяет внешние зависимости:
SQLite (in-memory), locmem-кэш, eager-режим Celery.
"""
from .settings import *  # noqa: F401,F403

DEBUG = True

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}

# Celery: задачи выполняются синхронно, без брокера
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True
CELERY_BROKER_URL = 'memory://'

# Быстрее токены не нужны, но оставляем дефолтные настройки JWT
