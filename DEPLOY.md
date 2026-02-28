# Развёртывание Docker-образа на удалённой машине

## GitHub Container Registry

Docker-образы публикуются в **GitHub Container Registry (GHCR)**:

```
ghcr.io/<username>/<repository>:<tag>
```

## Теги образов

| Тег | Описание |
|-----|----------|
| `latest` | Последняя сборка с master |
| `v1.0.0` | Семантическая версия (при создании тега) |
| `sha-<hash>` | Сборка по коммиту |

---

## Скачивание и запуск на удалённой машине

### 1. Аутентификация в GHCR

```bash
# Создайте Personal Access Token на GitHub:
# Settings → Developer settings → Personal access tokens → Tokens (classic)
# Scopes: read:packages

# Аутентификация
echo $GH_PAT | docker login ghcr.io -u <username> --password-stdin
```

### 2. Скачивание образа

```bash
# Последняя версия
docker pull ghcr.io/<username>/<repository>:latest

# Конкретная версия
docker pull ghcr.io/<username>/<repository>:v1.0.0
```

### 3. Запуск с помощью docker-compose

Создайте `docker-compose.yml` на удалённой машине:

```yaml
version: '3.8'

services:
  backend:
    image: ghcr.io/<username>/<repository>:latest
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - JWT_SECRET=${JWT_SECRET}
      - FRONTEND_URL=${FRONTEND_URL}
      - DB_MODE=database
      - DB_HOST=db
      - DB_PORT=5432
      - DB_USERNAME=postgres
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_NAME=tech_radar
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=tech_radar
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

Запуск:

```bash
# Создайте .env файл
cat > .env << EOF
JWT_SECRET=your-secret-key
FRONTEND_URL=http://your-domain.com
DB_PASSWORD=your-db-password
EOF

# Запуск
docker-compose up -d
```

### 4. Обновление образа

```bash
# Обновить образ
docker-compose pull

# Пересоздать контейнер
docker-compose up -d --force-recreate

# Очистить старые образы
docker image prune -f
```

---

## Автоматическое развёртывание

Для автоматического развёртывания можно использовать:

1. **GitHub Actions + SSH** — деплой по SSH после сборки
2. **ArgoCD / Flux** — GitOps подход для Kubernetes
3. **Watchtower** — автоматическое обновление контейнеров

### Пример с Watchtower

```yaml
# docker-compose.yml
services:
  watchtower:
    image: containrrr/watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    command: --interval 300 backend
    restart: unless-stopped
```

Watchtower будет проверять обновления каждые 5 минут и автоматически обновлять контейнер `backend`.

---

## Проверка работы

```bash
# Проверка статуса
docker-compose ps

# Логи
docker-compose logs -f backend

# Проверка API
curl http://localhost:5000/api/tech-radar
```
