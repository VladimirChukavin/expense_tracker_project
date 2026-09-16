# Развёртывание проекта в Production

## Подготовка сервера

### 1. Установка необходимых пакетов

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Python и зависимостей
sudo apt install python3.12 python3.12-venv python3-pip -y

# Установка PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Установка Redis
sudo apt install redis-server -y

# Установка Nginx
sudo apt install nginx -y

# Установка supervisor для управления процессами
sudo apt install supervisor -y

# Установка Git
sudo apt install git -y
```

### 2. Настройка PostgreSQL

```bash
# Войти в PostgreSQL
sudo -u postgres psql

# Создать БД и пользователя
CREATE DATABASE expense_tracker_prod;
CREATE USER expense_admin WITH PASSWORD 'strong_password_here';
ALTER ROLE expense_admin SET client_encoding TO 'utf8';
ALTER ROLE expense_admin SET default_transaction_isolation TO 'read committed';
ALTER ROLE expense_admin SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE expense_tracker_prod TO expense_admin;
\q
```

### 3. Клонирование проекта

```bash
# Создать директорию для проектов
sudo mkdir -p /var/www
cd /var/www

# Клонировать репозиторий
sudo git clone <repository-url> expense_tracker
sudo chown -R $USER:$USER /var/www/expense_tracker
```

### 4. Настройка виртуального окружения

```bash
cd /var/www/expense_tracker/backend

# Создать виртуальное окружение
python3.12 -m venv venv

# Активировать
source venv/bin/activate

# Установить зависимости
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn
```

### 5. Настройка переменных окружения

```bash
# Создать production .env файл
nano .env
```

```env
DEBUG=False
SECRET_KEY=your-very-long-secret-key-generated-securely
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

DB_NAME=expense_tracker_prod
DB_USER=expense_admin
DB_PASSWORD=strong_password_here
DB_HOST=localhost
DB_PORT=5432

CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
REDIS_URL=redis://localhost:6379/1

CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Email settings (опционально)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### 6. Применение миграций и сбор статики

```bash
# Применить миграции
python manage.py migrate

# Собрать статические файлы
python manage.py collectstatic --noinput

# Загрузить начальные данные
python manage.py loaddata fixtures/currencies.json

# Создать суперпользователя
python manage.py createsuperuser
```

## Настройка Gunicorn

### 1. Создать systemd service для Gunicorn

```bash
sudo nano /etc/systemd/system/gunicorn.service
```

```ini
[Unit]
Description=Gunicorn daemon for Expense Tracker
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/expense_tracker/backend
Environment="PATH=/var/www/expense_tracker/backend/venv/bin"
ExecStart=/var/www/expense_tracker/backend/venv/bin/gunicorn \
          --workers 3 \
          --bind unix:/var/www/expense_tracker/backend/gunicorn.sock \
          expense_tracker.wsgi:application

[Install]
WantedBy=multi-user.target
```

### 2. Запуск Gunicorn

```bash
sudo systemctl start gunicorn
sudo systemctl enable gunicorn
sudo systemctl status gunicorn
```

## Настройка Nginx

### 1. Создать конфигурацию Nginx

```bash
sudo nano /etc/nginx/sites-available/expense_tracker
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    client_max_body_size 20M;

    location = /favicon.ico { access_log off; log_not_found off; }

    location /static/ {
        alias /var/www/expense_tracker/backend/staticfiles/;
    }

    location /media/ {
        alias /var/www/expense_tracker/backend/media/;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/var/www/expense_tracker/backend/gunicorn.sock;
    }
}
```

### 2. Активировать конфигурацию

```bash
sudo ln -s /etc/nginx/sites-available/expense_tracker /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx
```

## Настройка SSL (Let's Encrypt)

```bash
# Установить certbot
sudo apt install certbot python3-certbot-nginx -y

# Получить SSL сертификат
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Автообновление сертификата
sudo systemctl status certbot.timer
```

## Настройка Celery

### 1. Создать supervisor конфигурацию для Celery Worker

```bash
sudo nano /etc/supervisor/conf.d/celery-worker.conf
```

```ini
[program:celery-worker]
command=/var/www/expense_tracker/backend/venv/bin/celery -A expense_tracker worker --loglevel=info
directory=/var/www/expense_tracker/backend
user=www-data
numprocs=1
stdout_logfile=/var/log/celery/worker.log
stderr_logfile=/var/log/celery/worker.log
autostart=true
autorestart=true
startsecs=10
stopwaitsecs=600
killasgroup=true
priority=998
```

### 2. Создать конфигурацию для Celery Beat

```bash
sudo nano /etc/supervisor/conf.d/celery-beat.conf
```

```ini
[program:celery-beat]
command=/var/www/expense_tracker/backend/venv/bin/celery -A expense_tracker beat --loglevel=info
directory=/var/www/expense_tracker/backend
user=www-data
numprocs=1
stdout_logfile=/var/log/celery/beat.log
stderr_logfile=/var/log/celery/beat.log
autostart=true
autorestart=true
startsecs=10
stopwaitsecs=600
killasgroup=true
priority=999
```

### 3. Создать директорию для логов и запустить

```bash
sudo mkdir -p /var/log/celery
sudo chown www-data:www-data /var/log/celery

sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start celery-worker
sudo supervisorctl start celery-beat
```

## Настройка логирования

```bash
# Создать директорию для логов
sudo mkdir -p /var/www/expense_tracker/backend/logs
sudo chown www-data:www-data /var/www/expense_tracker/backend/logs
```

## Настройка бэкапов базы данных

### Создать скрипт бэкапа

```bash
nano /var/www/expense_tracker/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/expense_tracker"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U expense_admin expense_tracker_prod > $BACKUP_DIR/db_$DATE.sql

# Backup media files
tar -czf $BACKUP_DIR/media_$DATE.tar.gz /var/www/expense_tracker/backend/media/

# Remove backups older than 7 days
find $BACKUP_DIR -type f -mtime +7 -delete
```

### Добавить в crontab

```bash
chmod +x /var/www/expense_tracker/backup.sh
crontab -e
```

Добавить строку:
```
0 2 * * * /var/www/expense_tracker/backup.sh
```

## Мониторинг и обслуживание

### Просмотр логов

```bash
# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Gunicorn logs
sudo journalctl -u gunicorn -f

# Celery logs
sudo tail -f /var/log/celery/worker.log
sudo tail -f /var/log/celery/beat.log
```

### Перезапуск сервисов

```bash
# Перезапуск Gunicorn
sudo systemctl restart gunicorn

# Перезапуск Nginx
sudo systemctl restart nginx

# Перезапуск Celery
sudo supervisorctl restart celery-worker
sudo supervisorctl restart celery-beat
```

### Обновление кода

```bash
cd /var/www/expense_tracker
git pull origin main

cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput

sudo systemctl restart gunicorn
sudo supervisorctl restart celery-worker
sudo supervisorctl restart celery-beat
```

## Чеклист для Production

- [ ] Изменён SECRET_KEY на случайное значение
- [ ] DEBUG=False
- [ ] Настроены ALLOWED_HOSTS
- [ ] Настроен HTTPS
- [ ] Настроены переменные окружения
- [ ] Применены миграции
- [ ] Собраны статические файлы
- [ ] Настроен Nginx
- [ ] Настроен Gunicorn
- [ ] Настроен Celery
- [ ] Настроены бэкапы
- [ ] Настроен firewall (ufw)
- [ ] Настроен мониторинг ошибок (Sentry)
- [ ] Настроены логи
- [ ] Протестирована работа API

## Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
sudo ufw status
```

## Готово!

Проект развёрнут и готов к использованию. Проверьте работу по адресу https://yourdomain.com
