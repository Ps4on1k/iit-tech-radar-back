import 'reflect-metadata';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
import { config } from './config';
import { techRadarRoutes, authRoutes, importRoutes, versionRoutes, auditRoutes, relatedTechRadarRoutes, notificationRoutes, dashboardsRoutes, aiConfigRoutes } from './routes';
import { AppDataSource } from './database';
import { enforceHttps, setSecureHeaders, errorHandler } from './middleware';
import { HttpException } from './exceptions';
import { logger } from './utils/logger';
import { taskScheduler } from './utils/taskScheduler';
import { DataSource } from 'typeorm';

let server: any;

/**
 * Применяет миграцию для изменения типа полей adoptionRate и popularityIndex
 * с numeric(2,2) на numeric(5,4) для поддержки значений > 1.0
 */
async function applyNumericMigration(queryRunner: any) {
  try {
    // Проверяем текущий тип данных
    const result = await queryRunner.query(`
      SELECT column_name, numeric_precision, numeric_scale
      FROM information_schema.columns
      WHERE table_name = 'tech_radar'
      AND column_name IN ('adoptionRate', 'popularityIndex')
    `);

    const needsMigration = result.some((row: any) =>
      row.numeric_precision !== 5 || row.numeric_scale !== 4
    );

    if (needsMigration) {
      logger.info('Применение миграции: изменение типа adoptionRate и popularityIndex на numeric(5,4)');
      await queryRunner.query(`
        ALTER TABLE "tech_radar"
        ALTER COLUMN "adoptionRate" TYPE numeric(5,4)
      `);
      await queryRunner.query(`
        ALTER TABLE "tech_radar"
        ALTER COLUMN "popularityIndex" TYPE numeric(5,4)
      `);
      logger.info('Миграция успешно применена');
    } else {
      logger.info('Миграция уже применена: поля имеют правильный тип numeric(5,4)');
    }
  } catch (error: any) {
    logger.error('Ошибка применения миграции:', { error: error?.message || error });
    // Не прерываем запуск сервера из-за ошибки миграции
  }
}

/**
 * Автоматическое применение миграций при запуске
 */
async function applyMigrations(dataSource: DataSource) {
  try {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    logger.info('Проверка и применение миграций...');

    // Применяем миграцию для полей adoptionRate и popularityIndex
    await applyNumericMigration(queryRunner);

    await queryRunner.release();
    logger.info('Все миграции применены успешно');
  } catch (error: any) {
    logger.error('Ошибка применения миграций:', { error: error?.message || error });
    // Не прерываем запуск сервера из-за ошибки миграции
  }
}

async function bootstrap() {
  const app = express();

  // Security headers (Helmet)
  app.use(helmet({
    contentSecurityPolicy: false, // Отключено для совместимости
    crossOriginEmbedderPolicy: false,
  }));

  // HTTPS middleware (только для production)
  app.use(enforceHttps);
  app.use(setSecureHeaders);

  logger.info('Запуск сервера...');

  // Инициализация базы данных (если используется)
  if (config.dbMode === 'database') {
    try {
      await AppDataSource.initialize();
      logger.info('База данных подключена');

      // Автоматическое применение миграций
      await applyMigrations(AppDataSource);

      // Запуск планировщика задач
      taskScheduler.start();

      // Автоматический seed пользователей
      await seedUsers();
      logger.info('Seed пользователей завершен');
    } catch (error: any) {
      logger.error('Ошибка подключения к БД:', { error: error?.message || error });
      logger.info('Запуск без базы данных');
    }
  } else {
    logger.info('Режим работы: mock данные');
  }

  // Middleware
  app.use(cors({
    origin: config.frontendUrl,
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Routes
  app.use('/api/tech-radar', techRadarRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/import', importRoutes);
  app.use('/api/version', versionRoutes);
  app.use('/api/audit', auditRoutes);
  app.use('/api/tech-radar', relatedTechRadarRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/dashboards', dashboardsRoutes);
  app.use('/api/ai-config', aiConfigRoutes);

  // Swagger API documentation (только для development)
  if (process.env.NODE_ENV !== 'production') {
    try {
      const openapiPath = path.resolve(__dirname, '../../openapi.yaml');
      const openapi = YAML.parse(fs.readFileSync(openapiPath, 'utf8'));
      app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi));
    } catch (error) {
      logger.warn('Не удалось загрузить Swagger документацию:', error);
    }
  }

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', dbMode: config.dbMode });
  });

  // 404 для не найденных маршрутов
  app.use((req, res) => {
    res.status(404).json({
      status: 404,
      message: `Маршрут не найден: ${req.method} ${req.originalUrl}`,
    });
  });

  // Глобальный обработчик ошибок (должен быть последним)
  app.use(errorHandler);

  // Start server
  const server = app.listen(config.port, () => {
    logger.info(`Сервер запущен на порту ${config.port}`);
    logger.info(`Режим БД: ${config.dbMode}`);
    logger.info(`Frontend URL: ${config.frontendUrl}`);
    logger.info('Учетные записи (по умолчанию):');
    logger.info('  Admin: admin@techradar.local / password123');
    logger.info('  User:  user@techradar.local / password123');
    logger.info('Для создания пользователей выполните: npm run seed');
  });
}

bootstrap().catch((error) => {
  logger.error('Критическая ошибка при запуске:', { error });
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Получен сигнал SIGTERM, завершение работы...');
  await gracefulShutdown();
});

process.on('SIGINT', async () => {
  logger.info('Получен сигнал SIGINT, завершение работы...');
  await gracefulShutdown();
});

async function gracefulShutdown() {
  logger.info('Закрытие HTTP сервера...');
  
  // Закрытие HTTP сервера
  if (server) {
    await new Promise<void>((resolve) => {
      server.close(() => {
        logger.info('HTTP сервер закрыт');
        resolve();
      });
    });
  }
  
  // Закрытие соединения с БД
  if (AppDataSource.isInitialized) {
    logger.info('Закрытие соединения с БД...');
    await AppDataSource.destroy();
  }

  // Остановка планировщика задач
  taskScheduler.stop();

  logger.info('Сервер остановлен');
  process.exit(0);
}

// Автоматический seed пользователей
async function seedUsers() {
  try {
    // Динамический импорт User после инициализации TypeORM
    const { User } = await import('./models/User');
    const userRepository = AppDataSource.getRepository(User);

    // Проверяем наличие пользователей
    const existingAdmin = await userRepository.findOne({ where: { email: 'admin@techradar.local' } });
    const existingUser = await userRepository.findOne({ where: { email: 'user@techradar.local' } });

    if (existingAdmin && existingUser) {
      logger.info('Пользователи уже существуют');
      return;
    }

    const hashedPassword = await bcrypt.hash('password123', 10);

    if (!existingAdmin) {
      const admin = userRepository.create({
        email: 'admin@techradar.local',
        password: hashedPassword,
        firstName: 'Админ',
        lastName: 'Админов',
        role: 'admin',
        isActive: true,
      });
      await userRepository.save(admin);
      logger.info('Создан администратор: admin@techradar.local');
    }

    if (!existingUser) {
      const user = userRepository.create({
        email: 'user@techradar.local',
        password: hashedPassword,
        firstName: 'Пользователь',
        lastName: 'Пользователей',
        role: 'user',
        isActive: true,
      });
      await userRepository.save(user);
      logger.info('Создан пользователь: user@techradar.local');
    }
  } catch (error: any) {
    // Игнорируем ошибку если таблица ещё не создана
    if (error?.message?.includes('relation') || error?.message?.includes('table')) {
      logger.info('Таблица пользователей будет создана автоматически');
    } else {
      logger.error('Ошибка при seed пользователей:', { error: error?.message || error });
    }
  }
}
