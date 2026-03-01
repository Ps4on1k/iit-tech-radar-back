import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { config } from './config';
import { techRadarRoutes, authRoutes, importRoutes, versionRoutes } from './routes';
import { AppDataSource } from './database';

async function bootstrap() {
  const app = express();

  // Инициализация базы данных (если используется)
  if (config.dbMode === 'database') {
    try {
      await AppDataSource.initialize();
      console.log('База данных подключена');

      // Автоматический seed пользователей
      await seedUsers();
      console.log('Seed пользователей завершен');
    } catch (error: any) {
      console.error('Ошибка подключения к БД:', error?.message || error);
      console.log('Запуск без базы данных');
    }
  } else {
    console.log('Режим работы: mock данные');
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

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', dbMode: config.dbMode });
  });

  // Start server
  app.listen(config.port, () => {
    console.log(`Сервер запущен на порту ${config.port}`);
    console.log(`Режим БД: ${config.dbMode}`);
    console.log(`Frontend URL: ${config.frontendUrl}`);
    console.log('');
    console.log('Учетные записи (по умолчанию):');
    console.log('  Admin: admin@techradar.local / password123');
    console.log('  User:  user@techradar.local / password123');
    console.log('');
    console.log('Для создания пользователей выполните: npm run seed');
  });
}

bootstrap().catch(console.error);

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
      console.log('Пользователи уже существуют');
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
      console.log('Создан администратор: admin@techradar.local');
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
      console.log('Создан пользователь: user@techradar.local');
    }
  } catch (error: any) {
    // Игнорируем ошибку если таблица ещё не создана
    if (error?.message?.includes('relation') || error?.message?.includes('table')) {
      console.log('Таблица пользователей будет создана автоматически');
    } else {
      console.error('Ошибка при seed пользователей:', error?.message || error);
    }
  }
}
