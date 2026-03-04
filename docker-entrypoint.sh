#!/bin/sh
set -e

echo "Starting Tech Radar Backend..."

# Запуск миграций перед стартом приложения (только для DB_MODE=database)
if [ "$DB_MODE" = "database" ]; then
  echo "Running database migrations..."
  npm run migration:run || {
    echo "Migration failed, but continuing with application start..."
  }
  echo "Migrations completed."
fi

# Start backend server
echo "Starting application..."
exec node dist/index.js
