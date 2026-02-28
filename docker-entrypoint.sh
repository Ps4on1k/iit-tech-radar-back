#!/bin/sh
# Wait for server to start and run seed

echo "=== Starting backend with seed ==="

# Start server in background
node dist/index.js &
SERVER_PID=$!

# Wait for server to be ready (TypeORM syncs schema)
echo "=== Waiting 15 seconds for DB connection ==="
sleep 15

# Run seed from compiled JS in dist/
echo "=== Running seed ==="
node dist/database/seed.js
echo "=== Seed completed ==="

# Bring server to foreground
echo "=== Starting server in foreground ==="
wait $SERVER_PID
