# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --frozen-lockfile
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache wget curl
COPY package*.json ./
RUN npm ci --frozen-lockfile

# Copy source files for migrations and seed
COPY src ./src
COPY typeorm.config.ts ./
COPY --from=builder /app/dist ./dist

EXPOSE 5000

# Run migrations and seed, then start server
CMD ["sh", "-c", "npm run migration:run && npm run seed && node dist/index.js"]
