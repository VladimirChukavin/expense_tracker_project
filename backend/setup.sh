#!/bin/bash

# Setup script for Expense Tracker project

echo "🚀 Setting up Expense Tracker..."

# Check Python version
python_version=$(python --version 2>&1 | awk '{print $2}')
echo "✓ Python version: $python_version"

# Create virtual environment
echo "📦 Creating virtual environment..."
python -m venv venv

# Activate virtual environment
echo "⚡ Activating virtual environment..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Install dependencies
echo "📥 Installing dependencies..."
cd backend
pip install --upgrade pip
pip install -r requirements.txt

# Copy environment file
echo "🔧 Setting up environment variables..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✓ Created .env file. Please edit it with your configuration."
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p media staticfiles logs fixtures

# Database setup
echo "🗄️  Setting up database..."
echo "Please make sure PostgreSQL is running and database 'expense_tracker' exists."
read -p "Press enter to continue with migrations..."

# Run migrations
echo "🔄 Running migrations..."
python manage.py makemigrations
python manage.py migrate

# Create superuser
echo "👤 Create superuser..."
python manage.py createsuperuser

# Load fixtures
echo "📊 Loading initial data..."
if [ -f fixtures/currencies.json ]; then
    python manage.py loaddata fixtures/currencies.json
fi

# Collect static files
echo "📦 Collecting static files..."
python manage.py collectstatic --noinput

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the development server:"
echo "  python manage.py runserver"
echo ""
echo "To start Celery worker:"
echo "  celery -A expense_tracker worker --loglevel=info"
echo ""
echo "To start Celery beat:"
echo "  celery -A expense_tracker beat --loglevel=info"
echo ""
echo "API documentation will be available at:"
echo "  http://localhost:8000/api/docs/"
echo ""
