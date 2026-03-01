# Tech Radar Backend - Документация проекта

## Обзор

Backend для приложения Tech Radar — системы управления техническим радаром технологий.

**Стек технологий:**
- Node.js + Express
- TypeScript
- TypeORM + PostgreSQL
- JWT аутентификация
- bcryptjs для хеширования паролей

**Режим работы:** База данных PostgreSQL (хранение пользователей и технологий)

---

## Правила версионирования (для Qwen Code)

**Текущая версия:** `1.0.3`

При внесении изменений в код backend обновляй версию в [`package.json`](./package.json) согласно правилам семантического версионирования:

| Тип изменения | Пример | Действие |
|---------------|--------|----------|
| **Bug fix** (исправление ошибки, мелкое изменение) | `1.0.0` → `1.0.1` | Увеличить **PATCH** (третья цифра) |
| **Feature** (новая фича, функциональность) | `1.0.1` → `1.1.0` | Увеличить **MINOR** (вторая цифра) |
| **Breaking change** (несовместимое изменение) | `1.9.0` → `2.0.0` | Увеличить **MAJOR** (первая цифра) |

**Важно:** Каждое изменение кода должно сопровождаться обновлением версии. Не забывай менять версию перед коммитом.

---

## Структура проекта

```
backend/
├── src/
│   ├── config/
│   │   └── index.ts              # Конфигурация приложения
│   ├── controllers/
│   │   ├── AuthController.ts     # Контроллер аутентификации
│   │   ├── TechRadarController.ts # Контроллер техрадара
│   │   ├── ImportController.ts   # Контроллер импорта/экспорта
│   │   └── index.ts
│   ├── database/
│   │   ├── index.ts              # TypeORM DataSource
│   │   ├── seed.ts               # Сид начальных данных
│   │   └── migrations/           # Миграции БД
│   ├── middleware/
│   │   ├── auth.ts               # Middleware аутентификации
│   │   └── index.ts
│   ├── models/
│   │   ├── TechRadarEntity.ts    # Entity техрадара
│   │   ├── User.ts               # Entity пользователя
│   │   └── index.ts
│   ├── resources/
│   │   ├── mock-data.json        # Mock данные техрадара (20 записей)
│   │   └── mock-users.json       # Mock пользователи (2 записи)
│   ├── routes/
│   │   ├── auth.ts               # Auth routes
│   │   ├── techRadar.ts          # TechRadar routes
│   │   ├── import.ts             # Import routes
│   │   └── index.ts
│   ├── services/
│   │   ├── AuthService.ts        # Сервис аутентификации
│   │   ├── ImportService.ts      # Сервис импорта с валидацией
│   │   ├── MockTechRadarRepository.ts # Mock репозиторий
│   │   ├── DatabaseTechRadarRepository.ts # DB репозиторий
│   │   ├── UserRepository.ts     # Репозиторий пользователей
│   │   └── index.ts
│   └── index.ts                  # Точка входа (автоматический seed)
├── docker-entrypoint.sh          # Скрипт запуска
├── Dockerfile
├── .env                          # Переменные окружения
├── .env.example                  # Пример переменных
├── typeorm.config.ts             # Конфигурация TypeORM для CLI
├── package.json
├── tsconfig.json
└── dist/                         # Скомпилированный код
```

---

## Запуск проекта

### Установка зависимостей
```bash
npm install
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

## Docker развёртывание

### Сборка образа

```bash
docker build -t tech-radar-backend .
```

### Запуск контейнера

```bash
docker run -d -p 5000:5000 \
  -e DB_HOST=localhost \
  -e DB_PASSWORD=your-password \
  tech-radar-backend
```

### Автоматический seed пользователей

При первом запуске контейнера автоматически создаются пользователи:
- `admin@techradar.local` / `password123` (role: admin)
- `user@techradar.local` / `password123` (role: user)

**Seed выполняется только если пользователей нет в БД.**

### GitHub Actions

При пуше в `main/master` или создании тега автоматически собирается и публикуется Docker-образ в GHCR:

```
ghcr.io/ps4on1k/iit-tech-radar-back:latest
```

Подробная инструкция в [`DEPLOY.md`](../DEPLOY.md).

---

## Переменные окружения (.env)

```env
# Порт сервера
PORT=5000

# JWT Secret
JWT_SECRET=tech-radar-jwt-secret-key-for-development

# URL фронтенда
FRONTEND_URL=http://localhost:3001

# Режим работы с БД (database)
DB_MODE=database

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=ваш_пароль
DB_NAME=tech_radar
```

---

## Учетные записи

Пользователи хранятся в базе данных PostgreSQL. Для создания начальных учетных записей выполните:

```bash
npm run seed
```

| Роль | Email | Пароль |
|------|-------|--------|
| **Admin** | admin@techradar.local | password123 |
| **User** | user@techradar.local | password123 |

**Права доступа:**
- **Admin**: Полный доступ (CRUD техрадара, управление пользователями, импорт/экспорт)
- **User**: Только чтение (просмотр техрадара)

---

## API Endpoints

### Tech Radar

| Метод | Endpoint | Доступ | Описание |
|-------|----------|--------|----------|
| GET | `/api/tech-radar` | Все | Получить все технологии |
| GET | `/api/tech-radar/filtered` | Все | Фильтрация и сортировка |
| GET | `/api/tech-radar/statistics` | Все | Статистика |
| GET | `/api/tech-radar/search?q=query` | Все | Поиск |
| GET | `/api/tech-radar/category/:category` | Все | По категории |
| GET | `/api/tech-radar/type/:type` | Все | По типу |
| GET | `/api/tech-radar/:id` | Admin | Получить технологию по ID |
| POST | `/api/tech-radar` | Admin | Создать технологию (с валидацией схемы) |
| PUT | `/api/tech-radar/:id` | Admin | Обновить технологию (с валидацией схемы) |
| DELETE | `/api/tech-radar/:id` | Admin | Удалить технологию |

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

### Import (только Admin)

| Метод | Endpoint | Доступ | Описание |
|-------|----------|--------|----------|
| POST | `/api/import/tech-radar` | Admin | Импорт технологий из JSON |
| GET | `/api/import/tech-radar` | Admin | Экспорт всех технологий |
| POST | `/api/import/tech-radar/validate` | Admin | Валидация данных перед импортом |

---

## Примеры запросов

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

### Импорт технологий (Admin)
```bash
curl -X POST "http://localhost:5000/api/import/tech-radar?updateExisting=true" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "id": "react-18.2",
      "name": "React",
      "version": "18.2.0",
      "type": "фреймворк",
      "category": "adopt",
      "firstAdded": "2020-01-15",
      "owner": "Frontend Team",
      "maturity": "stable",
      "riskLevel": "low",
      "license": "MIT",
      "supportStatus": "active",
      "businessCriticality": "critical"
    }
  ]'
```

**Ответ:**
```json
{
  "message": "Импорт успешно завершен",
  "result": {
    "success": true,
    "imported": 1,
    "skipped": 0,
    "errors": []
  }
}
```

### Валидация перед импортом
```bash
curl -X POST http://localhost:5000/api/import/tech-radar/validate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '[...]'
```

### Редактирование технологии (Admin)
```bash
curl -X PUT http://localhost:5000/api/tech-radar/react-18.2 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "version": "18.3.0",
    "lastUpdated": "2024-02-15",
    "description": "Обновленное описание",
    "adoptionRate": 0.98
  }'
```

**Ответ при успехе:**
```json
{
  "id": "react-18.2",
  "name": "React",
  "version": "18.3.0",
  ...
}
```

**Ответ при ошибке валидации:**
```json
{
  "error": "Ошибка валидации данных",
  "details": [
    {
      "field": "adoptionRate",
      "message": "adoptionRate должно быть числом от 0 до 1"
    }
  ]
}
```

### Создание пользователя (Admin)
```bash
curl -X POST http://localhost:5000/api/auth/users \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@techradar.local",
    "password": "newpassword123",
    "firstName": "Иван",
    "lastName": "Иванов",
    "role": "user"
  }'
```

### Блокировка пользователя (Admin)
```bash
curl -X POST http://localhost:5000/api/auth/users/:id/toggle-status \
  -H "Authorization: Bearer <token>"
```

---

## Модель данных TechRadarEntity

```typescript
{
  id: string;                    // Уникальный ID (формат: <название>-<версия>)
  name: string;                  // Название технологии
  version: string;               // Версия
  versionReleaseDate?: string;   // Дата выпуска версии (YYYY-MM-DD)
  type: 'фреймворк' | 'библиотека' | 'язык программирования' | 'инструмент';
  subtype?: 'фронтенд' | 'бэкенд' | 'мобильная разработка' | 'инфраструктура' | 'аналитика' | 'DevOps' | 'SaaS' | 'библиотека';
  category: 'adopt' | 'trial' | 'assess' | 'hold' | 'drop';
  description?: string;
  firstAdded: string;            // Дата первого добавления (YYYY-MM-DD)
  lastUpdated?: string;          // Дата последнего обновления (YYYY-MM-DD)
  owner: string;                 // Владелец (команда)
  stakeholders?: string[];       // Заинтересованные стороны
  dependencies?: Array<{name: string, version: string, optional?: boolean}>;
  maturity: 'experimental' | 'active' | 'stable' | 'deprecated' | 'end-of-life';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  license: string;
  usageExamples?: string[];
  documentationUrl?: string;
  internalGuideUrl?: string;
  adoptionRate?: number;         // 0-1
  recommendedAlternatives?: string[];
  relatedTechnologies?: string[];
  endOfLifeDate?: string;
  supportStatus: 'active' | 'limited' | 'end-of-life' | 'community-only';
  upgradePath?: string;
  performanceImpact?: 'low' | 'medium' | 'high';
  resourceRequirements?: {
    cpu: 'низкие' | 'средние' | 'высокие' | 'очень высокие';
    memory: 'низкие' | 'средние' | 'высокие' | 'очень высокие';
    storage: 'минимальные' | 'низкие' | 'средние' | 'высокие';
  };
  securityVulnerabilities?: string[];
  complianceStandards?: string[];
  communitySize?: number;
  contributionFrequency?: 'frequent' | 'regular' | 'occasional' | 'rare' | 'none';
  popularityIndex?: number;      // 0-1
  compatibility?: {
    os?: string[];
    browsers?: string[];
    frameworks?: string[];
  };
  costFactor?: 'free' | 'paid' | 'subscription' | 'enterprise';
  vendorLockIn: boolean;
  businessCriticality: 'low' | 'medium' | 'high' | 'critical';
}
```

---

## Модель данных User

```typescript
{
  id: string;           // UUID
  email: string;        // Уникальный email
  password: string;     // Хешированный пароль (bcrypt)
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  isActive: boolean;    // Статус блокировки
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Работа с базой данных

### Миграции

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

### Seed (начальные данные)

```bash
# Создать начальных пользователей (admin и user)
npm run seed
```

Скрипт проверяет наличие пользователей и создает их, если они отсутствуют.

---

## Импорт данных

### Валидация

Сервис импорта выполняет полную валидацию данных:

1. **Обязательные поля:** `id`, `name`, `version`, `type`, `category`, `firstAdded`, `owner`, `maturity`, `riskLevel`, `license`, `supportStatus`, `businessCriticality`

2. **Enum значения** (защита от SQL инъекций):
   - `type`, `subtype`, `category`, `maturity`, `riskLevel`
   - `supportStatus`, `performanceImpact`, `contributionFrequency`
   - `costFactor`, `businessCriticality`
   - `resourceRequirements.cpu`, `resourceRequirements.memory`, `resourceRequirements.storage`

3. **Форматы:**
   - Даты: `YYYY-MM-DD`
   - URL: `https://...` или `http://...`

4. **Числовые диапазоны:**
   - `adoptionRate`, `popularityIndex`: 0–1
   - `communitySize`: ≥ 0

### Защита от SQL инъекций

- Все запросы к БД выполняются через **TypeORM Repository** с параметризованными запросами
- Enum значения проверяются по whitelist перед использованием
- Данные не конкатенируются в SQL-строки

---

## Валидация при создании/редактировании

При создании (`POST /api/tech-radar`) и редактировании (`PUT /api/tech-radar/:id`) технологий выполняется автоматическая валидация данных через `TechRadarValidationService`.

### При создании:
- Проверяются все обязательные поля
- Выполняется полная валидация схемы

### При редактировании:
- Проверяются только переданные поля
- Обязательные поля не требуются (частичное обновление)
- ID технологии берется из пути, не из тела запроса

### Пример ответа при ошибке валидации:
```json
{
  "error": "Ошибка валидации данных",
  "details": [
    {
      "field": "type",
      "message": "Недопустимое значение type: неверное_значение"
    },
    {
      "field": "adoptionRate",
      "message": "adoptionRate должно быть числом от 0 до 1"
    }
  ]
}
```

### Коды ответов:
- `200` / `201` — Успешно
- `400` — Ошибка валидации (тело ответа содержит детали)
- `403` — Недостаточно прав (требуется admin)
- `404` — Технология не найдена (при редактировании/удалении)

---

## Middleware аутентификации

### authenticate
Проверяет JWT токен. Требует авторизации.

```typescript
import { authenticate } from './middleware/auth';

router.get('/protected', authenticate, (req, res) => {
  // Доступ только авторизованным
});
```

### isAdmin
Требует роль admin.

```typescript
import { authenticate, isAdmin } from './middleware/auth';

router.post('/admin-only', authenticate, isAdmin, (req, res) => {
  // Доступ только admin
});
```

### optionalAuth
Добавляет user в req, если токен есть (не требует авторизации).

```typescript
import { optionalAuth } from './middleware/auth';

router.get('/public', optionalAuth, (req, res) => {
  // Доступно всем, но user будет если есть токен
});
```

---

## Сервисы

### AuthService
```typescript
import { AuthService } from './services';

const authService = new AuthService();

// Валидация пользователя
const user = await authService.validateUser(email, password);

// Генерация токена
const token = authService.generateToken(payload);

// Проверка токена
const payload = authService.verifyToken(token);

// Создание пользователя
const newUser = await authService.createUser({
  email: 'user@example.com',
  password: 'password123',
  firstName: 'Иван',
  lastName: 'Иванов',
  role: 'user'
});
```

### ImportService
```typescript
import { ImportService } from './services/ImportService';

const importService = new ImportService();

// Импорт с обновлением существующих записей
const result = await importService.importTechRadar(data, {
  skipExisting: false,
  updateExisting: true
});

// Экспорт всех данных
const allData = await importService.exportTechRadar();
```

---

## Frontend интеграция

**URL фронтенда:** `http://localhost:3001`

**CORS настроен** на разрешение запросов с frontend URL.

**Токен аутентификации** передается в заголовке:
```
Authorization: Bearer <token>
```

---

## OpenAPI спецификация

Полная спецификация API доступна в файле [`openapi.yaml`](../openapi.yaml) в корне проекта.

Для просмотра используйте:
- [Swagger Editor](https://editor.swagger.io/)
- VS Code расширение "OpenAPI (Swagger) Editor"

---

## Безопасность

### Реализовано:
- ✅ JWT аутентификация
- ✅ Хеширование паролей (bcrypt)
- ✅ Ролевая модель (admin/user)
- ✅ Параметризованные SQL запросы (защита от SQL инъекций)
- ✅ Валидация входных данных
- ✅ Проверка уникальности email
- ✅ CORS

### Рекомендации для production:
- [ ] Rate limiting (express-rate-limit)
- [ ] Helmet middleware
- [ ] Логирование (Winston/Pino)
- [ ] HTTPS
- [ ] Secure JWT настройки (короткое время жизни токена)

---

## Контакты и поддержка

Проект готов к использованию и дальнейшей разработке.

**Основные команды:**
```bash
npm run dev          # Запуск в режиме разработки
npm run build        # Сборка проекта
npm run seed         # Создание начальных пользователей
npm run migration:run    # Применить миграции
npm run migration:generate # Создать миграцию
```
