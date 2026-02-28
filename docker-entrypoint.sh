#!/bin/sh
# Wait for server to start and run seed

# Start server in background
node dist/index.js &
SERVER_PID=$!

# Wait for server to be ready
sleep 10

# Run seed using ts-node-esm
npx ts-node-esm src/database/seed.ts

# Wait for seed to complete
sleep 2

# Bring server to foreground
wait $SERVER_PID
