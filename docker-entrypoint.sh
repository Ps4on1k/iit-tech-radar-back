#!/bin/sh
# Wait for server to start and run seed

# Start server in background
node dist/index.js &

# Wait for server to be ready
sleep 5

# Run seed
npm run seed

# Wait for seed to complete
sleep 2

# Bring server to foreground
wait
