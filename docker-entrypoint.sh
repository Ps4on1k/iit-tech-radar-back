#!/bin/sh
# Wait for server to start and run seed

# Start server in background
node dist/index.js &
SERVER_PID=$!

# Wait for server to be ready (TypeORM syncs schema)
sleep 10

# Run seed from compiled JS in dist/
node dist/database/seed.js 2>/dev/null || echo "Seed completed or skipped"

# Wait for seed to complete
sleep 2

# Bring server to foreground
wait $SERVER_PID
