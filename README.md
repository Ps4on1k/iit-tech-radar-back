# Tech Radar Backend

Backend для системы управления техническим радаром технологий.

**Текущая версия:** `1.28.0`

---

## 📋 Обзор

**Стек технологий:**
- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **ORM:** TypeORM
- **Database:** PostgreSQL
- **Аутентификация:** JWT
- **Безопасность:** bcryptjs, helmet, express-rate-limit
- **Логирование:** Winston
- **Документация:** Swagger UI (OpenAPI)

**Режимы работы:**
- 🗄️ **Database** — хранение в PostgreSQL (production)
- 🔧 **Mock** — mock-данные в памяти (development/testing)

---

## 🚀 Быстрый старт

### Установка зависимостей
```bash
npm install
```

### Настройка окружения
```bash
# Скопируйте .env.example в .env
cp .env.example .env

# Отредактируйте .env с вашими параметрами
```

### Запуск в режиме разработки
```bash
npm run dev
```

### Сборка и запуск production
```bash
npm run build
npm start
```

**Сервер доступен на:** `http://localhost:5000`

---

## 📁 Структура проекта

```
backend/
├── src/
│   ├── __tests__/              # Юнит-тесты
│   │   ├── controllers/
│   │   ├── dto/
│   │   ├── middleware/
│   │   ├── repositories/
│   │   └── services/
│   ├── config/                 # Конфигурация приложения
│   │   └── index.ts
│   ├── constants/              # Константы и enum
│   │   └── tech-radar.constants.ts
│   ├── controllers/            # Контроллеры
│   │   ├── BaseController.ts   # Базовый контроллер
│   │   ├── AuthController.ts
│   │   ├── TechRadarController.ts
│   │   ├── ImportController.ts
│   │   ├── AuditController.ts
│   │   ├── NotificationController.ts
│   │   ├── RelatedTechRadarController.ts
│   │   └── VersionController.ts
│   ├── database/               # TypeORM конфигурация
│   │   ├── index.ts            # DataSource
│   │   ├── seed.ts             # Seed данные
│   │   └── migrations/         # Миграции БД
│   ├── dto/                    # Data Transfer Objects
│   │   ├── LoginDto.ts
│   │   ├── CreateUserDto.ts
│   │   ├── UpdateUserDto.ts
│   │   └── ChangePasswordDto.ts
│   ├── exceptions/             # Классы исключений
│   │   └── HttpException.ts
│   ├── features/               # Модули по фичам
│   │   ├── auth/
│   │   ├── import/
│   │   └── tech-radar/
│   ├── middleware/             # Express middleware
│   │   ├── auth.ts             # Аутентификация
│   │   ├── errorHandler.ts     # Обработка ошибок
│   │   ├── https.ts            # HTTPS редирект
│   │   ├── rateLimiter.ts      # Rate limiting
│   │   └── validateDto.ts      # Валидация DTO
│   ├── models/                 # TypeORM Entity
│   │   ├── TechRadarEntity.ts
│   │   ├── User.ts
│   │   ├── AuditLogEntity.ts
│   │   ├── NotificationEntity.ts
│   │   ├── TechRadarReviewEntity.ts
│   │   ├── TechRadarTagEntity.ts
│   │   ├── TechRadarAttachmentEntity.ts
│   │   └── TechRadarHistoryEntity.ts
│   ├── repositories/           # Репозитории для связанных данных
│   │   ├── AttachmentRepository.ts
│   │   ├── HistoryRepository.ts
│   │   ├── NotificationRepository.ts
│   │   ├── ReviewRepository.ts
│   │   └── TagRepository.ts
│   ├── resources/              # Mock данные
│   │   ├── mock-data.json
│   │   └── mock-users.json
│   ├── routes/                 # Маршруты
│   │   ├── auth.ts
│   │   ├── techRadar.ts
│   │   ├── import.ts
│   │   ├── audit.ts
│   │   ├── notifications.ts
│   │   ├── relatedTechRadar.ts
│   │   └── version.ts
│   ├── services/               # Бизнес-логика
│   │   ├── AuthService.ts
│   │   ├── AuditService.ts
│   │   ├── ImportService.ts
│   │   ├── NotificationService.ts
│   │   ├── RelatedTechRadarService.ts
│   │   ├── TechRadarValidationService.ts
│   │   ├── UserRepository.ts
│   │   ├── ITechRadarRepository.ts
│   │   ├── MockTechRadarRepository.ts
│   │   └── DatabaseTechRadarRepository.ts
│   ├── shared/                 # Общие модули
│   │   ├── constants/
│   │   ├── interfaces/
│   │   └── utils/
│   ├── utils/                  # Утилиты
│   │   └── logger.ts
│   └── index.ts                # Точка входа
├── docker-entrypoint.sh
├── Dockerfile
├── .env
├── .env.example
├── typeorm.config.ts
├── package.json
└── tsconfig.json
```

---

## 🔐 Учетные записи

При первом запуске автоматически создаются:

| Роль | Email | Пароль | Права |
|------|-------|--------|-------|
| **Admin** | admin@techradar.local | password123 | Полный доступ |
| **User** | user@techradar.local | password123 | Только чтение |

**Ручной запуск seed:**
```bash
npm run seed
```

---

## 📡 API Endpoints

### Tech Radar

| Метод | Endpoint | Доступ | Описание |
|-------|----------|--------|----------|
| GET | `/api/tech-radar` | Все | Все технологии |
| GET | `/api/tech-radar/filtered` | Все | Фильтрация + пагинация |
| GET | `/api/tech-radar/statistics` | Все | Статистика |
| GET | `/api/tech-radar/search?q=` | Все | Поиск |
| GET | `/api/tech-radar/category/:category` | Все | По категории |
| GET | `/api/tech-radar/type/:type` | Все | По типу |
| GET | `/api/tech-radar/:id` | Admin | По ID |
| POST | `/api/tech-radar` | Admin/Manager | Создать |
| PUT | `/api/tech-radar/:id` | Admin/Manager | Обновить |
| DELETE | `/api/tech-radar/:id` | Admin/Manager | Удалить |

### Auth

| Метод | Endpoint | Доступ | Описание |
|-------|----------|--------|----------|
| POST | `/api/auth/login` | Все | Войти |
| GET | `/api/auth/me` | Авторизованные | Текущий пользователь |
| GET | `/api/auth/users` | Admin | Все пользователи |
| GET | `/api/auth/users/:id` | Admin | Пользователь по ID |
| POST | `/api/auth/users` | Admin | Создать пользователя |
| PUT | `/api/auth/users/:id` | Admin | Обновить пользователя |
| DELETE | `/api/auth/users/:id` | Admin | Удалить пользователя |
| POST | `/api/auth/users/:id/password` | Admin | Установить пароль |
| POST | `/api/auth/users/:id/toggle-status` | Admin | Блокировать/разблокировать |
| POST | `/api/auth/change-password` | Авторизованные | Сменить пароль |

### Import (Admin/Manager)

| Метод | Endpoint | Доступ | Описание |
|-------|----------|--------|----------|
| POST | `/api/import/tech-radar` | Admin/Manager | Импорт из JSON |
| GET | `/api/import/tech-radar` | Admin/Manager | Экспорт всех данных |
| POST | `/api/import/tech-radar/validate` | Admin/Manager | Валидация данных |

### Audit Log (Admin)

| Метод | Endpoint | Доступ | Описание |
|-------|----------|--------|----------|
| GET | `/api/audit/logs` | Admin | Все логи |
| GET | `/api/audit/logs/user/:userId` | Admin | Логи пользователя |
| GET | `/api/audit/logs/entity/:entity` | Admin | Логи по сущности |

### Notifications

| Метод | Endpoint | Доступ | Описание |
|-------|----------|--------|----------|
| GET | `/api/notifications` | Авторизованные | Уведомления пользователя |
| GET | `/api/notifications/unread-count` | Авторизованные | Счетчик непрочитанных |
| PUT | `/api/notifications/:id/read` | Авторизованные | Отметить прочитанным |
| PUT | `/api/notifications/read-all` | Авторизованные | Все прочитаны |
| DELETE | `/api/notifications/:id` | Авторизованные | Удалить уведомление |
| DELETE | `/api/notifications/read` | Авторизованные | Удалить прочитанные |

### Related TechRadar Data

| Метод | Endpoint | Доступ | Описание |
|-------|----------|--------|----------|
| GET | `/api/tech-radar/:id/reviews` | Все | Отзывы |
| POST | `/api/tech-radar/:id/reviews` | Авторизованные | Создать отзыв |
| PUT | `/api/tech-radar/:id/reviews/:reviewId` | Авторизованные | Обновить отзыв |
| DELETE | `/api/tech-radar/:id/reviews/:reviewId` | Авторизованные | Удалить отзыв |
| GET | `/api/tech-radar/:id/tags` | Все | Теги |
| PUT | `/api/tech-radar/:id/tags` | Admin/Manager | Обновить теги |
| DELETE | `/api/tech-radar/:id/tags/:tagId` | Admin/Manager | Удалить тег |
| GET | `/api/tech-radar/:id/attachments` | Все | Вложения |
| POST | `/api/tech-radar/:id/attachments` | Admin/Manager | Создать вложение |
| DELETE | `/api/tech-radar/:id/attachments/:attachmentId` | Admin/Manager | Удалить вложение |
| GET | `/api/tech-radar/:id/history` | Авторизованные | История изменений |
| POST | `/api/tech-radar/:id/history` | Admin | Записать в историю |

### Version

| Метод | Endpoint | Доступ | Описание |
|-------|----------|--------|----------|
| GET | `/api/version` | Все | Версия backend |

### AI Config (Admin)

| Метод | Endpoint | Доступ | Описание |
|-------|----------|--------|----------|
| GET | `/api/ai-config` | Admin | Все конфигурации AI полей |
| GET | `/api/ai-config/:id` | Admin | Конфигурация по ID |
| GET | `/api/ai-config/global-settings` | Admin | Глобальные настройки AI API |
| POST | `/api/ai-config` | Admin | Создать конфигурацию |
| PUT | `/api/ai-config/:id` | Admin | Обновить конфигурацию |
| PUT | `/api/ai-config/global-settings` | Admin | Обновить глобальные настройки |
| DELETE | `/api/ai-config/:id` | Admin | Удалить конфигурацию |

### RabbitMQ Integration (AsyncAPI)

Backend автоматически создает очереди RabbitMQ при старте и обрабатывает сообщения от Qwen Agent.

| Очередь | Направление | Описание |
|---------|-------------|----------|
| `techradar.requests` | Backend → Agent | Запросы на обновление AI |
| `techradar.responses` | Agent → Backend | Ответы с результатами AI |
| `techradar.requests.dlq` | - | Dead Letter Queue для неудачных запросов |
| `techradar.responses.dlq` | - | Dead Letter Queue для неудачных ответов |

**Логика обработки сообщений из `techradar.responses`:**

1. **Если есть `technologyId`** - обновляется существующая сущность
2. **Если нет `technologyId`** - поиск по паре `name` + `version`
   - При совпадении - обновление
   - При отсутствии совпадения - создание новой сущности
3. **Обновляются только поля из сообщения** (фильтрация по разрешенным полям)

---

## 📝 Примеры запросов

### Вход в систему
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@techradar.local","password":"password123"}'
```

**Ответ:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid...",
    "email": "admin@techradar.local",
    "firstName": "Админ",
    "lastName": "Админов",
    "role": "admin"
  }
}
```

### Фильтрация с пагинацией
```bash
curl "http://localhost:5000/api/tech-radar/filtered?category=adopt&type=фреймворк&page=1&limit=10&sortBy=name&sortOrder=asc"
```

**Ответ:**
```json
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Создание технологии (Admin/Manager)
```bash
curl -X POST http://localhost:5000/api/tech-radar \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "React",
    "version": "18.2.0",
    "type": "фреймворк",
    "subtype": "фронтенд",
    "category": "adopt",
    "firstAdded": "2024-01-15",
    "owner": "Frontend Team",
    "maturity": "stable",
    "riskLevel": "low",
    "license": "MIT",
    "supportStatus": "active",
    "businessCriticality": "critical"
  }'
```

### Импорт технологий
```bash
curl -X POST "http://localhost:5000/api/import/tech-radar?updateExisting=true" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '[{...}]'
```

---

## 🗄️ Модель данных

### TechRadarEntity

```typescript
{
  // Основные
  id: string;                    // UUID
  name: string;
  version: string;
  versionReleaseDate?: string;   // YYYY-MM-DD
  type: TechRadarType;           // enum
  subtype?: TechRadarSubtype;    // enum
  category: TechRadarCategory;   // enum
  description?: string;
  
  // Жизненный цикл
  firstAdded: string;            // YYYY-MM-DD
  lastUpdated?: string;
  maturity: TechRadarMaturity;   // enum
  endOfLifeDate?: string;
  supportStatus: TechRadarSupportStatus; // enum
  
  // Бизнес
  owner: string;
  stakeholders?: string[];
  license: string;
  costFactor?: TechRadarCostFactor;
  vendorLockIn: boolean;
  businessCriticality: TechRadarBusinessCriticality;
  
  // Технические
  dependencies?: Array<{name: string, version: string, optional?: boolean}>;
  performanceImpact?: TechRadarPerformanceImpact;
  resourceRequirements?: {cpu, memory, storage};
  compatibility?: {os[], browsers[], frameworks[]};
  
  // Безопасность
  riskLevel: TechRadarRiskLevel;
  securityVulnerabilities?: string[];
  complianceStandards?: string[];
  
  // Документация
  usageExamples?: string[];
  documentationUrl?: string;
  internalGuideUrl?: string;
  upgradePath?: string;
  recommendedAlternatives?: string[];
  relatedTechnologies?: string[];
  
  // Метрики
  adoptionRate?: number;         // 0-1
  communitySize?: number;
  contributionFrequency?: TechRadarContributionFrequency;
  popularityIndex?: number;      // 0-1
  
  // Обновления
  versionToUpdate?: string;
  versionUpdateDeadline?: string;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
}
```

### User

```typescript
{
  id: string;           // UUID
  email: string;        // Unique
  password: string;     // Hashed (bcrypt)
  firstName: string;
  lastName: string;
  role: 'admin' | 'user' | 'manager';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🛡️ Безопасность

### Реализовано:
- ✅ **JWT аутентификация** — токены с expiration
- ✅ **Хеширование паролей** — bcrypt с солью
- ✅ **Ролевая модель** — admin / manager / user
- ✅ **Rate limiting** — защита от brute-force
- ✅ **Helmet middleware** — security headers
- ✅ **Параметризованные SQL запросы** — защита от SQL инъекций
- ✅ **Валидация входных данных** — class-validator + DTO
- ✅ **CORS** — ограничение доменов
- ✅ **HTTPS принудительно** — для production
- ✅ **Аудит операций** — логирование всех действий

### Middleware:
```typescript
// Требует аутентификации
authenticate

// Требует роль
isAdmin
isManagerOrAdmin
requireRole('admin', 'manager')

// Опциональная аутентификация
optionalAuth
```

---

## 🧪 Тестирование

```bash
# Запустить все тесты
npm test

# В режиме watch
npm run test:watch

# С покрытием
npm run test:coverage

# Для CI/CD
npm run test:ci
```

**Покрытие:** 120+ юнит-тестов для сервисов, контроллеров, DTO, middleware.

---

## 📦 Работа с БД

### Миграции

**Автоматическое применение:**
При запуске приложения все миграции применяются автоматически. Вам не нужно вручную запускать миграции — система сама проверит и применит необходимые изменения при подключении к базе данных.

**В Docker:**
При запуске контейнера миграции выполняются автоматически через `docker-entrypoint.sh` перед стартом приложения. Если миграция уже применена, она пропускается.

**Ручное управление (опционально):**
```bash
# Применить все миграции
npm run migration:run

# Создать новую миграцию
npm run migration:generate -- src/database/migrations/NameMigration

# Откатить последнюю миграцию
npm run migration:revert

# Показать статус миграций
npm run migration:show
```

### Seed
```bash
# Создать начальных пользователей
npm run seed
```

---

## 🐳 Docker

### Сборка образа
```bash
docker build -t tech-radar-backend .
```

### Запуск контейнера
```bash
docker run -d -p 5000:5000 \
  -e DB_HOST=postgres \
  -e DB_PORT=5432 \
  -e DB_USERNAME=postgres \
  -e DB_PASSWORD=secret \
  -e DB_NAME=tech_radar \
  -e JWT_SECRET=your-secret-key \
  tech-radar-backend
```

### Docker Compose
```bash
docker-compose up -d
```

### GitHub Actions
При пуше в `main/master` автоматически публикуется образ в GHCR:
```
ghcr.io/ps4on1k/iit-tech-radar-back:latest
```

Подробная инструкция в [`DEPLOY.md`](../DEPLOY.md).

---

## ⚙️ Переменные окружения

```env
# Порт сервера
PORT=5000

# JWT Secret (обязательно!)
JWT_SECRET=your-super-secret-key

# URL фронтенда
FRONTEND_URL=http://localhost:3001

# Режим работы с БД (database | mock)
DB_MODE=database

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-password
DB_NAME=tech_radar

# Уровень логирования
LOG_LEVEL=info

# Режим (development | production)
NODE_ENV=development
```

---

## 📚 Документация

### Swagger UI
В режиме development Swagger доступен на:
```
http://localhost:5000/api/docs
```

### OpenAPI спецификация
Полная спецификация в файле [`openapi.yaml`](../openapi.yaml).

---

## 🏗️ Архитектура

### Модули (Feature-based)
```
src/features/
├── auth/           # Аутентификация и пользователи
├── import/         # Импорт/экспорт данных
└── tech-radar/     # Управление технологиями
```

### Shared модули
```
src/shared/
├── constants/      # Общие константы
├── interfaces/     # Общие интерфейсы
└── utils/          # Утилиты
```

### Слои приложения:
1. **Controllers** — HTTP запросы/ответы
2. **Services** — Бизнес-логика
3. **Repositories** — Доступ к данным
4. **Models** — Entity схемы

### Dependency Injection:
```typescript
// Интерфейс репозитория
export interface ITechRadarRepository {
  findAll(): Promise<TechRadarEntity[]>;
  findById(id: string): Promise<TechRadarEntity | undefined>;
  save(entity: TechRadarEntity): Promise<TechRadarEntity>;
  delete(id: string): Promise<boolean>;
  // ...
}

// Реализации:
// - MockTechRadarRepository (для тестов/mock режима)
// - DatabaseTechRadarRepository (TypeORM)
```

---

## 📈 Логирование

Используется **Winston** с уровнями:
- `error` — критические ошибки
- `warn` — предупреждения
- `info` — информационные сообщения
- `debug` — отладочная информация

**Транспорты:**
- Console (development)
- File: `logs/error.log`, `logs/info.log` (production)

```typescript
import { logger } from './utils/logger';

logger.info('Сообщение', { meta: 'данные' });
logger.error('Ошибка', { error });
```

---

## 🔄 Версионирование

Семантическое версионирование (SemVer):

| Тип изменения | Пример | Действие |
|---------------|--------|----------|
| **Bug fix** | `1.0.0` → `1.0.1` | PATCH ↑ |
| **Feature** | `1.0.1` → `1.1.0` | MINOR ↑ |
| **Breaking change** | `1.9.0` → `2.0.0` | MAJOR ↑ |

**Перед коммитом обновите версию в [`package.json`](./package.json).**

---

## 🤝 Вклад в проект

См. [`CONTRIBUTING.md`](../CONTRIBUTING.md) с подробными гайдлайнами.

---

## 📞 Поддержка

**Основные команды:**
```bash
npm run dev              # Разработка
npm run build            # Сборка
npm run seed             # Seed пользователей
npm run migration:run    # Миграции
npm test                 # Тесты
```

**Проект готов к использованию и дальнейшей разработке.**
