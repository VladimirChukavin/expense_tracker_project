# Makefile for Expense Tracker

.PHONY: help install migrate run test clean docker-up docker-down

help:
	@echo "Available commands:"
	@echo "  make install       - Install dependencies"
	@echo "  make migrate       - Run database migrations"
	@echo "  make superuser     - Create superuser"
	@echo "  make run          - Run development server"
	@echo "  make celery       - Run Celery worker"
	@echo "  make beat         - Run Celery beat"
	@echo "  make test         - Run tests"
	@echo "  make clean        - Clean cache files"
	@echo "  make docker-up    - Start Docker containers"
	@echo "  make docker-down  - Stop Docker containers"

install:
	cd backend && pip install -r requirements.txt

migrate:
	cd backend && python manage.py makemigrations && python manage.py migrate

superuser:
	cd backend && python manage.py createsuperuser

fixtures:
	cd backend && python manage.py loaddata fixtures/currencies.json

run:
	cd backend && python manage.py runserver

celery:
	cd backend && celery -A expense_tracker worker --loglevel=info

beat:
	cd backend && celery -A expense_tracker beat --loglevel=info

test:
	cd backend && pytest

clean:
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f

docker-migrate:
	docker-compose exec backend python manage.py migrate

docker-superuser:
	docker-compose exec backend python manage.py createsuperuser
